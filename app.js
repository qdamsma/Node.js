require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use((req, res, next) => {
    User.findById('69c160c46f2c2e91fe69482c')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => { console.log(err) })
});

app.use(shopRoutes);
app.use('/admin', adminRoutes);


app.use(errorController.get404);

mongoose.connect(process.env.MONGO_URI)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Quinten',
                    email: 'quinten@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    }).catch(err => {
        console.log(err);
    });

