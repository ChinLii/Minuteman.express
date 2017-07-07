var express = require('express');
var router = express.Router();
var Minute = require('../models/minute');
var jwt = require('jsonwebtoken');
var config = require('../../config/database');
var Session = require('../models/session');
var User = require('../models/user');

 
var auth = function(req,res,next){
    console.log('Cookie id :' + req.cookies.secret );
    Session.findOne({'secret':req.cookies.secret },function(err,result){
        if(err){
            console.log(err);
            res.sendStatus(401);
        }else{
            console.log(result);
            if(result){
                return next();
            }else{
                return res.redirect('/login');
            }
        }
    })
};

var authadmin = function(req,res,next){
    Session.findOne({'secret':req.cookies.secret },function(err,result){
        if(err){
            console.log(err);
            res.sendStatus(401);
        }else{
            console.log(result);
            if(result){
                User.findOne({'email':result.email},function(err,user){
                    if(err){
                        console.log(err);
                    }else{
                        if(user.isAdmin === true){
                            return next();
                        }else{
                            return res.redirect('/');
                        }
                    }
                })
                //return next();
            }else{
                return res.redirect('/login');
            }
        }
    })
}

router.get('/',auth,function (req,res){
    //query database minute and email
    Session.findOne({'secret':req.cookies.secret },function(err,result){
        if(err){
            console.log(err);
        }else{
            User.findOne({'email': result.email},function(err,user){
                if(err){
                    console.log(err);
                }else{
                    console.log(user);
                    if(user.isAdmin === true){
                        res.render('admin',{user: result});
                    }else {
                        res.render('home',{user: result});
                    }
                }
            })
            //res.render('home',{user: result});
        }
    })
    //res.render('home');
});

router.get('/create',auth, function (req, res) {
    Session.findOne({'secret': req.cookies.secret},function(err,result){
        if(err){
            console.log(err);
            res.json({ error: true, message: err });
        }else{
            //list all user and send to create form
            User.find({ 'isAdmin': false }, { email: 1, _id: 0},function(err,users){
                if(err){
                    res.json({error: true,message: err});
                }else{
                    res.render('form',{data:result.email,users: users});
                }
            })
            //res.render('form',{data:result.email});
        }
    })
    //res.render('form');
})

router.get('/minute/:id',auth, function (req, res) {
    var data;
    Minute.findOne({ 'id': req.params.id }, function (err, result) {
        if (err) {
            res.json({ error: true, message: err });
        } else {
            data = result;
            User.find({'isAdmin':false},{email:1,_id:0},function(err,users){
                if(err){
                    res.json({error: true,message: err});
                }else{
                    res.render('minute_form', { data: data, users: users });
                }
            })
            //res.render('minute_form', { data: data });
        }
    })
});

router.get('/report',authadmin ,function (req, res) {
    var data;
    var minute;
    Minute.find({}, {}, { sort: { 'createDate': -1 }, limit: 5 }, function (err, result1) {
        if (err) {
            res.json({ error: true, message: err });
            console.log(err);
        } else {
            minute = result1;
            Minute.aggregate([
                {
                    $unwind: "$tasks"
                },
                {
                    $group: {
                        _id: "$tasks.type",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ], function (err, result) {
                if (err) {
                    res.json({ error: true, message: err });
                    console.log(err);
                } else {
                    data = result;
                    console.log(data);
                    res.render('dashboard', { data: data, minute: minute });
                }
            })

        }
    })
})

module.exports = router;