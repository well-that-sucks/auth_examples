const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

const SESSION_KEY = 'Authorization';
const jwtKey = "KeyForJsonWebToken";
const tokenExpirationTime = 60;

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'JWT_Test1',
    },
    {
        login: 'MyLogin',
        password: 'MyPwd',
        username: 'JWT_Test2',
    }
]

app.get('/', (req, res) => {
    let token = req.get(SESSION_KEY);
    let reqBody;
    if (token) {
        try {
            reqBody = jwt.verify(token, jwtKey);
        } catch(e) {
            if (e instanceof jwt.JsonWebTokenError) {
                return res.sendFile(path.join(__dirname + '/index.html'));
            }
        }
    } else {
        return res.sendFile(path.join(__dirname + '/index.html'));
    }

    res.json({username: reqBody.username, logout: `http://localhost:3000/logout`});
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const user = users.find((user) => {
        return (user.login == login && user.password == password);
    });

    if (user) {
        const token = jwt.sign({ login: login, username: user.username}, jwtKey, {algorithm: "HS256", expiresIn: tokenExpirationTime });
        return res.json({token: token});
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`JWT app listening on port ${port}`)
})
