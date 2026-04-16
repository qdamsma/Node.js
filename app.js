require('dotenv').config();
const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { csrfSync } = require('csrf-sync');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = process.env.MONGO_URI;
const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
  connectionOptions: {
    tls: true,
    tlsAllowInvalidCertificates: false
  }
});

const { generateToken, csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => {
        return req.headers['csrf-token'] || req.body['_csrf'];
    }
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfSynchronisedProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = generateToken(req);
  next();
})

const createLimiter = (max, view, pageTitle) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  handler: (req, res) => {
    res.status(429).render(view, {
      path: req.path,
      pageTitle,
      errorMessage: 'Te veel pogingen. Probeer het over 15 minuten opnieuw.',
      oldInput: { email: '', password: '' },
      validationErrors: []
    });
  }
});
app.post('/login', createLimiter(10, 'auth/login', 'Login'));
app.post('/signup', createLimiter(5, 'auth/signup', 'Signup'));
app.post('/reset', createLimiter(3, 'auth/reset', 'Reset Password'));


app.use((req, res, next) => {
  if (!req.session || !req.session.user){
    return next();
  }
  User.findById(req.session.user)
    .then(user => {
      if (!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.locals.isAuthenticated = req.session ? req.session.isLoggedIn : false;
  res.locals.csrfToken = req.session ? generateToken(req) : '';
  res.status(500).render('500', {pageTitle: 'Error!', path: '/500'});
})

mongoose
  .connect(MONGODB_URI, {tls: true})
  .then(result => {
    // https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
