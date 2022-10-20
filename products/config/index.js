require('dotenv').config();

module.exports = {
   pgUri: process.env.POSTGRES_URL,
   port: process.env.PORT || 3000,
   jwtSecret: process.env.JWT_SECRET,
   rabbitMQUri: process.env.RABBITMQ_URL
}
