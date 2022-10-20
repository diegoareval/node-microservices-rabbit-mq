

const express = require('express');
require('express-async-errors');
const sequelize = require('./database');
const isAuthenticated = require('./middlewares/isAuthenticated.js');
const Order = require('./models/order.model');
const amqp = require('amqplib');
const {port, rabbitMQUri} = require("./config")

async function createOrder(products,  userEmail){
    let total = 0;
    for (let t = 0; t < products.length; ++t) {
        total += +products[t].price;
    }
    products = products.map(product => {
        return product.id;
    });

    const newOrder = await Order.create({
        products,
        creator: userEmail,
        totalPrice: total,
    });

    return newOrder;
}
let channel;
async function connect(){
    const connection = await amqp.connect(rabbitMQUri);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");
}

connect().then(() => {
    channel.consume('ORDER', data => {
        console.log('Consuming ORDER service');
        const { products, userEmail } = JSON.parse(data.content);
        createOrder(products, userEmail)
            .then(newOrder => {
                channel.ack(data);
                channel.sendToQueue(
                    'PRODUCT',
                    Buffer.from(JSON.stringify({ newOrder }))
                );
            })
            .catch(err => {
                console.log(err);
            });
    });
});

const app = express();

app.use(express.json());

app.listen(port, () => {
    console.log(`Orders Service at ${port}`);
});

app.get('/orders', isAuthenticated, async (req, res) => {
    const results = await Order.findAll();
    res.status(200).json(results);
});

sequelize.sync();

