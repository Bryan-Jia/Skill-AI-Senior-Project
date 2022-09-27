const express = require('express');
const app = express();
const path = require('path');

//Import routes
const routes = require('./routes');

app.use('/', routes)
app.use(express.static(path.join(__dirname + "/public")));

app.listen(9000);

