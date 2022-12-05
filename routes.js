const { debug } = require('console');
const proxy = require('express-http-proxy');
const express = require('express');
const router = express.Router();
const path = require('path');
const storeAnswer = require('./dataStorage');

const {getPrevRes}=require("./blobApi.js")

const auth = require('./login.js');const { userInfo } = require('os');
const {calculateStats} = require('./calculateStats');

router.get('/', (req, res) => {
    if (!!req.cookies['id'] && auth.verify(req.cookies['id'])) {
        res.redirect('/experiment');
    } else {
        res.redirect('/login');
    }
});

router.get('/login', (req, res) => {
    if (!req.cookies['id'] || !auth.verify(req.cookies['id'])) {
        res.sendFile(path.join(__dirname, '/login.html'));
    } else {
        res.redirect('/experiment');
    }
});

router.get('/experiment', (req, res) => {
    if (!!req.cookies['id'] && auth.verify(req.cookies['id'])) {
        res.sendFile(path.join(__dirname, '/experiment.html'));
    } else {
        res.sendFile(path.join(__dirname, '/login.html'));
    }
});

router.get('/performance', (req, res) => {
    if (!!req.cookies['id'] && auth.verify(req.cookies['id'])) {
        res.sendFile(path.join(__dirname, '/performance.html'));
    } else {
        res.sendFile(path.join(__dirname, '/login.html'));
    }
});

router.get('/sessionFinished', (req, res) => {
    if (!!req.cookies['id'] && auth.verify(req.cookies['id'])) {
        res.sendFile(path.join(__dirname, '/sessionFinished.html'));
    } else {
        res.sendFile(path.join(__dirname, '/login.html'));
    }
});

router.post('/api/login', (req, res) => {   
    if (!!req.body.id) {
        console.log(auth.verify(req.body.id));
        
        if (auth.verify(req.body.id)) {
            res.cookie('id', req.body.id);
            res.cookie('imageOrder', auth.verify(req.body.id));
            res.redirect('/experiment');
        } else {
            res.send('invalid login');
            res.end();
        }
    } else {
        res.send('tester ID required');
        res.end();
    }
});

router.post('/api/answer', async (req, res) => {
    console.log(req.body);
 //   if (!!req.cookies['id'] && auth.verify(req.cookies['id'])) {
    let stats = await calculateStats(req.body);
    try {
        /*TODO: after receiving a set of data from the user, the server should redirect the user to
          the performance page and add some queries indicating user's performance so far. */
        res.send('/performance?sessionTPR=' + stats[0] +
                 '&sessionFNR=' + stats[1] + 
                 '&sessionPrecision=' +  stats[2] +
                 '&cumTPR=' + stats[3] +
                 '&cumFNR=' + stats[4] +
                 '&cumPrecision=' + stats[5]
                 );
    } catch (err) {
        res.status(400).send(err);
    }
 //   }
});



module.exports = router;
