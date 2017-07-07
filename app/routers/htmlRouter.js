var express = require('express');
var router = express.Router();
var Minute = require('../models/minute');
var Session = require('../models/session');
var path = require('path');


router.get('/login',function(req,res){
    res.render('index');
});
router.get('/signup',function(req,res){
    res.render('signup');
});
router.get('/requestNewPass',function(req,res){
    res.render('requestpass');
})

module.exports = router;