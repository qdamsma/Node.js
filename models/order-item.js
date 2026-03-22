const Sequelize = require('sequelize');

const sequelize = require('../util/database')

const OrderItem = sequelize.define('orderItem', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = OrderItem;