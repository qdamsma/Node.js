const Sequelize = require('sequelize');

const sequelize = require('../util/database')

const Cart = sequelize.define('cartItem', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = Cart;