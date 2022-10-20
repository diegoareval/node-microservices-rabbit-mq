const { Sequelize } = require('sequelize');
const {pgUri} = require('../config')

const sequelize = new Sequelize(pgUri, {
    dialect: 'postgres',
    logging: false,
});

sequelize
    .authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));

module.exports = sequelize;
