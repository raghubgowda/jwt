const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const log = console.log;
require('dotenv').config();


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

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { name : username };   
    res.json(generateToken(user));
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

app.listen(4000);

log('Auth server started!!!');