const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const log = console.log;
require('dotenv').config();
const bcrypt = require('bcrypt');

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

app.post('/register', (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const user = {
        username: req.body.username,
        password: hashedPassword
    };
    users.push(user);
    return res.sendStatus(204);
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

app.listen(3000);

log('Server staretd!!!');