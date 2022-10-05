const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

//Import routes
const routes = require('./routes');


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/public")));
app.use('/', routes)

app.listen(9000);

