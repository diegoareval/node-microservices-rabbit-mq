const express = require('express');
require('express-async-errors');
const sequelize = require('./database');
const isAuthenticated = require('./middlewares/isAuthenticated');
const Product = require('./models/product.model');
const amqp = require('amqplib');
const Sequelize = require('sequelize');
const {port, rabbitMQUri} = require("./config");

let channel;
async function connect(){
    const connection = await amqp.connect(rabbitMQUri);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}

await connect();
const app = express();

app.use(express.json());

app.listen(port, () => {
    console.log(`Products Service at ${port}`);
});

app.get('/products', async (req, res) => {
    const results = await Product.findAll();
    res.status(200).json(results);
});

app.post('/products', isAuthenticated, async (req, res) => {
    const { name, price, description, imageURL } = req.body;

    const product = await Product.create({
        name,
        price,
        description,
        imageURL,
        creator: req.user.email,
    });

    res.status(200).json(product);
});

app.post('/products/buy', isAuthenticated, async (req, res) => {
const {ids} = req.body;

    const products = await Product.findAll({
        where: {
            id: {
                [Sequelize.Op.in]: ids,
            },
        },
    });

    let order;

    channel.sendToQueue("ORDER", Buffer.from({
        products, userEmail: req.user.email
    }));

    await channel.consume("PRODUCT", (data) => {
        order = JSON.parse(data.content);
    });
    res.json(order);

});


sequelize.sync();
