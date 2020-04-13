const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const log = console.log;
require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const UserSchema = require('./models/User');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = [];
let movies = [
    {
        title: 'Inception',
        leadRole: 'Leonardo DiCaprio',
        director: 'Christopher Nolan',
        rating: 4.8
    },
    {
        title: 'Marriage Story',
        leadRole: 'Adam Driver',
        director: 'Noah Baumbach',
        rating: 4.4
    },
    {
        title: 'Parasite',
        leadRole: 'Kang-ho Song',
        director: 'Bong Joon-ho',
        rating: 4.6
    }
];

app.get('/movies', authenticate, (req, res) => {
    res.json(movies);
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/register', async(req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const user = {
        name: req.body.username,
        password: hashedPassword
    };

    try {
        const userSchema = new UserSchema(user);
        const newUser = await userSchema.save();
        log(newUser);
        users.push(user);
        return res.sendStatus(204);   
    } catch (error) {
        log(error.message);
        res.status(500).send('Error while registering a new user');    
    }

});


function authenticate(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if( token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user;
        next();
    })
}

mongoose.connect(process.env.MONGO_DB_CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    log('Connected to database!!!');
});
app.listen(3000);

log('Server started!!!');