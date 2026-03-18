const Sequelize = require('sequelize');

const sequelize = require('../util/database')

const User = sequelize.define('user', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING
});

module.exports = User;