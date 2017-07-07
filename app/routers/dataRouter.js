var express = require('express');
var router = express.Router();
var Minute = require('../models/minute');
var Session = require('../models/session');

router.get('/allminutes',function(req,res){
    Session.findOne({'secret':req.cookies.secret},function(err,user){
        if(err){
            console.log(err);
            res.json({ error: true, message: err });
        }else{
            if(user){
                //console.log(user);
                Minute.find({ $or:[ {'ownerEmail':user.email}, {'attendeeEmail': new RegExp(user.email,"i")}]},{},{sort: { 'createDate': -1 }},function(err,result){
                    if(err){
                        console.log(err);
                        res.json({ error: true, message: err });
                    }else{
                        res.json({data: result});
                    }
                })
            }
        }
    });
})

router.get('/adminAllMinutes',function(req,res){
    Minute.find({},{},{sort: { 'createDate': -1 }},function(err,result){
        if(err){
            console.log(err);
            res.json({ error: true, message: err });
        }else{
            res.json({data: result});
        }
    })
})

module.exports = router;