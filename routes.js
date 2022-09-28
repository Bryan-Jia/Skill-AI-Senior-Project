const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    console.log(__dirname);
    res.sendFile(path.join(__dirname, '/index.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/login.html'));
});

router.get('/experiment', (req, res) => {
    res.sendFile(path.join(__dirname, '/experiment.html'));
});

router.post('/api/login', (req, res) =>{
    console.log(req.body);
});

router.post('/api/answer', (req, res) =>{
    console.log(req.body);
});

module.exports = router;
