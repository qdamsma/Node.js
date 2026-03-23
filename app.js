require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use((req, res, next) => {
    User.findById('69c11e689e8807a57ee5464b')
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => { console.log(err)})
});

app.use(shopRoutes);
app.use('/admin', adminRoutes);


app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000);
});

