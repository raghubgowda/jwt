const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const log = console.log;
require('dotenv').config();


app.use(express.json());

const posts = [
    {
        username: 'Raghu', 
        age:35
    },
    {
        username: 'Maaya', 
        age:30
    }
]

app.get('/posts', authenticate, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name));
});

function authenticate(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if( token == null)
        return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user;
        next();
    })
}

app.listen(3000);

log('Server staretd!!!');