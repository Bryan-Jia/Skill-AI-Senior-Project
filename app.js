const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require("cookie-parser");
require('dotenv').config();


const app = express();
//Import routes
const routes = require('./routes');

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname + "/public")));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use('/', routes)

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Listening on post ${port}...`));

