const express = require('express');
const jwt = require('jsonwebtoken');
const http = require('http');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const UserSchema = require('./models/User');
const log = console.log;
require('dotenv').config();

const app = express();

app.use(express.json());

let refreshTokens = [];

app.post('/refreshToken', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if(refreshToken == null) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403).send('Please login again');
        else {
            removeRefreshToken(refreshToken);
            res.json(generateToken( { name : user.name } ));
        }
    });
});

app.post('/login', async (req, res) => {
    try {
        //Fetching users with a timeout of 500ms
        const users = await Promise.race([ new Promise(res => setTimeout(res, 500, [])), UserSchema.find()]);
        const user = users.find(user => user.name === req.body.username)

        if(user == null) return res.status(404).send('user not found');

        log(`passed: ${req.body.password} hashed:${user.password}`);

        if(await bcrypt.compare(req.body.password, user.password)) {
            res.json(generateToken( { name : user.name } ));
        } else {
            res.status(401).send('Incorrect password')
        }
    } catch(error) {
        log(error);
        res.status(500).send('Error while validating the user')
    }
    
});

app.delete('/logout', (req, res) => {
    removeRefreshToken(req.body.token);
    res.sendStatus(204);
});

function removeRefreshToken(refreshToken){
    refreshTokens = refreshTokens.filter( token => token !== refreshToken);
}

function generateToken(user){
    const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn : '30s'});
    const refresh_token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refresh_token);
    return {access_token : access_token, refresh_token : refresh_token};
}

mongoose.connect(process.env.MONGO_DB_CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    log('Connected to database!!!');
});

app.listen(process.env.AUTH_SERVER_PORT);

log(`Auth server started on port ${process.env.AUTH_SERVER_PORT}`);