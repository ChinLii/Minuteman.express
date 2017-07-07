var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var uuid = require('uuid');
var Minute = require('../models/minute');
var User = require('../models/user');
var Session = require('../models/session');
var TempUser = require('../models/tempUser');
var RequestNewPassword = require('../models/request');
var config = require('../../config/database');

var api_key = 'api_key';
var domain = 'domainname';

var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

//var Mailjet = require('node-mailjet').connect('API_KEY', 'API_SECRET');

//var sendMail = Mailjet.post("send");


router.post("/signup", function (req, res) {
    //var db = new User();
    var tempUser = new TempUser();
    User.findOne({ 'email': req.body.email }, function (err, result) {
        if (err) {
            console.log(err);
            res.json({ error: true, message: err });
        } else {
            if (result == null) {
                console.log('This email avaliable');
                var rand = uuid.v4();
                link = req.protocol + '://' + req.get('host')+"/api/verify?id=" + rand;
                /*var emailData = {
                    "FromEmail": "online-confirmation@burda.co.th",
                    "FromName": "Minute System",
                    "Subject": "[Minute System] Please verity your email address",
                    "Html-part":"Hello from MinuteMan.express,<br><br> Please verify your email address so we know that it's really you! <br><br><a href=" + link + "> Verify my email address </a><br><br>The MinuteMan express<br>For additional support enquiries<br>email us: suppport@minuteman.express <br> -------------------------------",
                    "To":req.body.email
                }*/
                var data = {
                    from : 'confirmation@mg.minuteman.express',
                    to : req.body.email,
                    subject : "[Minute System] Please verity your email address" ,
                    html : "Hello from MinuteMan.express,<br><br> Please verify your email address so we know that it's really you! <br><br><a href=" + link + "> Verify my email address </a><br><br>The MinuteMan express<br>For additional support enquiries<br>email us: suppport@minuteman.express <br> -------------------------------"
                }
                tempUser.id = rand;
                tempUser.email = req.body.email;
                tempUser.password = tempUser.generateHash(req.body.password);
                /*sendMail.request(emailData)
                .then(result=>{
                    console.log("Send the email already");
                        tempUser.save(function (err) {
                            if (err) {
                                console.log(err);
                                res.json({ save: true, message: err });
                            } else {
                                console.log('Save temp user already');
                                console.log('Wait for verify email');
                                emailData = null;
                                res.json({ save: true, message: "Saved!" });
                            }
                        })
                }).catch(err=> {
                        console.log(err);
                        res.json({ error: true, message: err });
                }) */
                mailgun.messages().send(data, function (error, body) {
                    if (error){
                        console.log(error);
                        res.json({ error: true, message: error });
                    }
                    else {
                        console.log("Send the email already");
                        tempUser.save(function (err) {
                            if (err) {
                                console.log(err);
                                res.json({ save: true, message: err });
                            } else {
                                console.log('Save temp user already');
                                console.log('Wait for verify email');
                                emailData = null;
                                res.json({ save: true, message: "Saved!" });
                            }
                        })
                    }
                });

            } else {
                console.log("Already existing");
                res.json({ save: false, message: "Already existing" });
            }
        }
    })
});

router.get('/verify', function (req, res) {
    var db = new User();
    var id;
    TempUser.findOne({ 'id': req.query.id }, function (err, result) {
        if (err) {
            console.log(err);
            res.json({ error: true, message: err });
        } else {
            if (result != null) {
                db.email = result.email;
                db.password = result.password;
                db.isAdmin = false;
                id = result.id;
                if (req.query.id == id) {
                    db.save(function (err) {
                        if (err) {
                            console.log(err);

                        } else {
                            console.log("save successful");
                        }
                    });
                    TempUser.remove({ 'email': result.email }, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Remove tempuser already');
                        }
                    });
                    console.log("Email is verified");
                    res.render('verifyPage', { data: result });
                }
                else {
                    console.log('Email is not verified');
                    res.render("oop", { data: "Bad requested." });
                }
            } else {
                res.render('oop', { data: "This email is already verified." });
            }
        }
    });
});

router.post("/forgetPass", function (req, res) {
    //forgot password
    User.findOne({ 'email': req.body.email }, function (err, result) {
        if (err) {
            console.log(err);
            res.json({ success: false, message: err });
        } else {
            if (result) {
                var requestPass = new RequestNewPassword();
                var rand = uuid.v4();
                link = req.protocol + '://' + req.get('host')+"/api/requestNewPassword?id=" + rand;
                /*var emailData = {
                    "FromEmail": "online-confirmation@burda.co.th",
                    "FromName": "Minute System",
                    "Subject": "[Minute System] Reset Password System",
                    "Html-part" : "Hello from MinuteMan.express,<br>Aww Snap, did you forget your details? We have just received your request,<br>Please click on the below link to reset your password<br><br> <a href=" + link + "> link </a><br><br>Stay focused.<br>The MinuteMan express<br>For additional support enquiries<br>email us: suppport@minuteman.express <br> ------------------------------------------------------------------------------",
                    "To":req.body.email
                }*/
                var data = {
                    from : 'confirmation@mg.minuteman.express',
                    to : req.body.email,
                    subject : "[Minute System] Reset Password System" ,
                    html : "Hello from MinuteMan.express,<br>Aww Snap, did you forget your details? We have just received your request,<br>Please click on the below link to reset your password<br><br> <a href=" + link + "> link </a><br><br>Stay focused.<br>The MinuteMan express<br>For additional support enquiries<br>email us: suppport@minuteman.express <br> ------------------------------------------------------------------------------"
                }
                requestPass.id = rand;
                requestPass.email = req.body.email;
                /*sendMail.request(emailData)
                .then(result=>{
                    requestPass.save(function (err) {
                            if (err) {
                                console.log(err);
                                res.end(err);
                            }
                            else {
                                console.log("Making a new request to request new password");
                                console.log('Wait...... for response from email');
                                res.json({ success: true, message: "Your request is on it's way! Please check your email inbox to reset your password" })
                                emailData = null;
                            }
                        });
                    
                }).catch(err=> {
                        console.log(err);
                        res.json({ error: true, message: err });
                }) */
                mailgun.messages().send(data, function (error, body) {
                    if(error){
                        console.log(error);
                        res.json({ error: true, message: error });
                    }else{
                        requestPass.save(function (err) {
                            if (err) {
                                console.log(err);
                                res.end(err);
                            }
                            else {
                                console.log("Making a new request to request new password");
                                console.log('Wait...... for response from email');
                                res.json({ success: true, message: "Your request is on it's way! Please check your email inbox to reset your password" })
                                emailData = null;
                            }
                        });
                    }
                });
                
            } else {
                res.json({ success: false, message: "This email is not in the system" });
            }
        }
    })

});

router.get('/requestNewPassword', function (req, res) {
    RequestNewPassword.findOne({ 'id': req.query.id }, function (err, result) {
        if (err) {
            console.log(err);
        } else if (result != null) {
            if (result.id == req.query.id) {
                res.render('resetPassword', { 'email': result.email });
            } else { 
                res.render('already', { data: "You have successfully changed your password previously." })
            }
        } else {
            res.render('already', { data: "You have successfully changed your password previously." })
        }
    })

});

router.post('/updatePass',function(req,res){
    var db = new User();
    console.log(req.body.email);
    var password = db.generateHash(req.body.password); // encode password 
    User.findOne({ 'email': req.body.email }, function (err, result) {
        if (err) {
            console.log(err);
            res.end(err);
        } else {
            //update password and hash password tobe encode
            console.log(result);
            if (result == null) {
                //res.end("This email is not existed in the system");
                res.render('oop', { data: "This email is not existed in the system" });
            }
            else {
                result.update({
                    "password": password // update password
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.end(err);
                    } else {
                        console.log('Update password successfully');
                        RequestNewPassword.remove({ 'email': req.body.email }, function (req, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Remove request')
                            }
                        });
                        res.end('Changed');
                    }
                });
            }
        }
    })
    res.redirect('/');
    //res.render('changePass');
});

//logout 
router.get('/logout', function (req, res) {
    Session.remove({ 'secret': req.cookies.secret }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.clearCookie("success");
            res.clearCookie("secret");
            res.redirect('/login');
        }
    });
});

router.post("/login", function (req, res) {
    var session = new Session();
    User.findOne({ 'email': req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
            res.json({ error: true, message: err });
            //res.end(err);
        } else {
            //user not found!
            if (user === null) {
                res.cookie('success', false, { expires: new Date(new Date().getTime() + 60000) });
                console.log('Authentication failed; email or password is incorrect. Try again.');
                res.redirect('/login');

            }
            //user found!
            else {
                if (!user.validPassword(req.body.password)) {
                    res.cookie('success', false, { expires: new Date(new Date().getTime() + 60000) });
                    console.log('Authentication failed; email or password is incorrect. Try again.')
                    res.redirect('/login');

                }
                else {
                    var secret = uuid.v4();
                    session.secret = secret;
                    session.email = user.email;
                    session.save(function (err) {
                        if (err) {
                            console.log(err);
                            res.end(err);
                        } else {
                            console.log("Login successfully");
                            res.cookie('secret', secret, { expires: new Date(new Date().getTime() + 1296000000) });
                            res.clearCookie("success");
                            res.redirect('/');

                        }
                    });
                }
            }
        }
    })
});

router.post('/submit', function (req, res) {
    var minute = new Minute();
    var data = null;
    var id = uuid.v4();
    minute.id = id;
    minute.title = req.body.title;
    minute.ownerEmail = req.body.ownerEmail;
    minute.description = req.body.description;
    minute.createDate = req.body.createDate;
    minute.attendeeEmail = req.body.attendees;
    minute.cc = req.body.cc;

    var toEmail = req.body.attendees.split(",");
    toEmail.push(minute.ownerEmail);
    var ccEmail = req.body.cc.split(",");
    var temphtml = "<table style='width:100%;'><tr><td style='width:15%;'><center>Topic</center></td><td style='width:15%;'><center>Type</center></td><td style='width:40%;'><center>Note</center></td><td style='width:15%;'><center>Owner</center></td><td style='width:15%;'><center>Due</center></td></tr>";

    for (var i = 0; i < Object.keys(req.body.tasks).length; i++) {
        minute.tasks.push(req.body.tasks[i]);
        
        temphtml += "<tr><td class='column' style='width:15%;'><center>"+ req.body.tasks[i].topic+"</center></td><td class='column' style='width:15%;'><center>"+ req.body.tasks[i].type+"</center></td><td class='column' style='width:40%;'>"+req.body.tasks[i].note+"</td><td class='column' style='width:15%;'><center>"+req.body.tasks[i].owner+"</center></td><td class='column' style='width:15%;'><center>"+req.body.tasks[i].due+"</center></td></tr>";
    }
    temphtml += "</table>";
    minute.save(function (err) {
        if (err) {
            res.json({ 'error': true });
            console.log(err);
        } else {
            console.log('Save successfully!');
        }
    });
    var htmlfile1 = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD XHTML 1.0 Transitional //EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'><!--[if IE]><html xmlns='http://www.w3.org/1999/xhtml' class='ie-browser' xmlns:v='urn:schemas-microsoft-com:vml' xmlns:o='urn:schemas-microsoft-com:office:office'><![endif]--><!--[if !IE]><!--><html style='margin: 0;padding: 0;' xmlns='http://www.w3.org/1999/xhtml'><!--<![endif]--><head> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--> <meta http-equiv='Content-Type' content='text/html; charset=utf-8'> <meta name='viewport' content='width=device-width'> <!--[if !mso]><!--><meta http-equiv='X-UA-Compatible' content='IE=edge'><!--<![endif]--> <title>Template Base</title> <style type='text/css' id='media-query'> body { margin: 0; padding: 0; }table { border-collapse: collapse; table-layout: fixed; }* { line-height: inherit; }a[x-apple-data-detectors=true] { color: inherit !important; text-decoration: none !important; }.ie-browser .col, [owa] .block-grid .col { display: table-cell; float: none !important; vertical-align: top; }.ie-browser .num12, .ie-browser .block-grid, [owa] .num12, [owa] .block-grid { width: 500px !important; }.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }.ie-browser .mixed-two-up .num4, [owa] .mixed-two-up .num4 { width: 164px !important; }.ie-browser .mixed-two-up .num8, [owa] .mixed-two-up .num8 { width: 328px !important; }.ie-browser .block-grid.two-up .col, [owa] .block-grid.two-up .col { width: 250px !important; }.ie-browser .block-grid.three-up .col, [owa] .block-grid.three-up .col { width: 166px !important; }.ie-browser .block-grid.four-up .col, [owa] .block-grid.four-up .col { width: 125px !important; }.ie-browser .block-grid.five-up .col, [owa] .block-grid.five-up .col { width: 100px !important; }.ie-browser .block-grid.six-up .col, [owa] .block-grid.six-up .col { width: 83px !important; }.ie-browser .block-grid.seven-up .col, [owa] .block-grid.seven-up .col { width: 71px !important; }.ie-browser .block-grid.eight-up .col, [owa] .block-grid.eight-up .col { width: 62px !important; }.ie-browser .block-grid.nine-up .col, [owa] .block-grid.nine-up .col { width: 55px !important; }.ie-browser .block-grid.ten-up .col, [owa] .block-grid.ten-up .col { width: 50px !important; }.ie-browser .block-grid.eleven-up .col, [owa] .block-grid.eleven-up .col { width: 45px !important; }.ie-browser .block-grid.twelve-up .col, [owa] .block-grid.twelve-up .col { width: 41px !important; }@media only screen and (min-width: 520px) { .block-grid { width: 500px !important; } .block-grid .col { display: table-cell; Float: none !important; vertical-align: top; } .block-grid .col.num12 { width: 500px !important; } .block-grid.mixed-two-up .col.num4 { width: 164px !important; } .block-grid.mixed-two-up .col.num8 { width: 328px !important; } .block-grid.two-up .col { width: 250px !important; } .block-grid.three-up .col { width: 166px !important; } .block-grid.four-up .col { width: 125px !important; } .block-grid.five-up .col { width: 100px !important; } .block-grid.six-up .col { width: 83px !important; } .block-grid.seven-up .col { width: 71px !important; } .block-grid.eight-up .col { width: 62px !important; } .block-grid.nine-up .col { width: 55px !important; } .block-grid.ten-up .col { width: 50px !important; } .block-grid.eleven-up .col { width: 45px !important; } .block-grid.twelve-up .col { width: 41px !important; } }@media (max-width: 520px) { .block-grid, .col { min-width: 320px !important; max-width: 100% !important; } .block-grid { width: calc(100% - 40px) !important; } .col { width: 100% !important; } .col > div { margin: 0 auto; } img.fullwidth { max-width: 100% !important; } } </style></head><!--[if mso]><body class='mso-container' style='background-color:#FFFFFF;'><![endif]--><!--[if !mso]><!--><body class='clean-body' style='margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF'><!--<![endif]--> <div class='nl-container' style='min-width: 320px;Margin: 0 auto;background-color: #FFFFFF'> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid mixed-two-up'> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='333' style=' width:333px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num8' style='Float: left;min-width: 320px;max-width: 328px;width: 320px;width: calc(1800% - 9032px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='font-size:12px;line-height:14px;color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;text-align:left;'><p style='margin: 0;font-size: 12px;line-height: 14px'>&nbsp;<span style='font-size: 26px; line-height: 31px;'><strong>MinuteMan.express</strong></span></p><p style='margin: 0;font-size: 12px;line-height: 14px'><span style='font-size: 11px; line-height: 13px;'><span style='font-size: 11px; line-height: 13px;' id='_mce_caret' data-mce-bogus='true'>"+req.body.title+"&nbsp;</span><br data-mce-bogus='1'></span></p></div> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td><td align='center' width='167' style='; width:167px; padding-right: 10px; padding-left: 10px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num4' style='Float: left;max-width: 320px;min-width: 164px;width: 320px;width: calc(78164px - 15600%);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <!--[if !mso]><!--><div style='Margin-right: 10px; Margin-left: 10px;'><!--<![endif]--> <div></div> <!--[if !mso]><!--></div><!--<![endif]--> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid mixed-two-up'> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='167' style=' width:167px; padding-right: 10px; padding-left: 10px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num4' style='Float: left;max-width: 320px;min-width: 164px;width: 320px;width: calc(78164px - 15600%);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <!--[if !mso]><!--><div style='Margin-right: 10px; Margin-left: 10px;'><!--<![endif]--> <div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='font-size:12px;line-height:14px;color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;text-align:left;'><p style='margin: 0;font-size: 12px;line-height: 14px'><strong>Minute taker</strong></p><p style='margin: 0;font-size: 12px;line-height: 14px'><strong>Attendees</strong></p><p style='margin: 0;font-size: 12px;line-height: 14px'><strong>Others</strong></p></div> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <!--[if !mso]><!--></div><!--<![endif]--> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td><td align='center' width='333' style='; width:333px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num8' style='Float: left;min-width: 320px;max-width: 328px;width: 320px;width: calc(1800% - 9032px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='font-size:12px;line-height:14px;color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;text-align:left;'><p style='margin: 0;font-size: 12px;line-height: 14px'>"+req.body.ownerEmail+"</p><p style='margin: 0;font-size: 12px;line-height: 14px'>"+req.body.attendees+"</p><p style='margin: 0;font-size: 12px;line-height: 14px'>"+req.body.cc+"</p></div> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid '> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='500' style=' width:500px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num12' style='min-width: 320px;max-width: 500px;width: 320px;width: calc(18000% - 89500px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 5px; font-size:1px'>&nbsp;</div> <!--[if !mso]><!--><div align='center' style='Margin-right: 10px;Margin-left: 10px;'><!--<![endif]--> <div style='line-height: 10px; font-size:1px'>&nbsp;</div> <!--[if (mso)|(IE)]><table width='100%' align='center' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 10px;padding-left: 10px;'><![endif]--> <div style='border-top: 1px solid #BBBBBB; width:100%; font-size:1px;'>&nbsp;</div> <!--[if (mso)|(IE)]></td></tr></table><![endif]--> <div style='line-height:10px; font-size:1px'>&nbsp;</div><!--[if !mso]><!--></div><!--<![endif]-->"
    

    var htmlfile2 = "<div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <div style='line-height: 5px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid '> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='500' style=' width:500px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num12' style='min-width: 320px;max-width: 500px;width: 320px;width: calc(18000% - 89500px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 5px; font-size:1px'>&nbsp;</div> <div align='center' class='button-container center' style='Margin-right: 10px;Margin-left: 10px;'> <div style='line-height:10px;font-size:1px'>&nbsp;</div> <a href='https://minuteman.express/minute/"+id+"' target='_blank' style='color: #ffffff; text-decoration: none;'> <!--[if mso]> <v:roundrect xmlns:v='urn:schemas-microsoft-com:vml' xmlns:w='urn:schemas-microsoft-com:office:word' href='https://minuteman.express/minute/"+id+"' style='height:42px; v-text-anchor:middle; width:206px;' arcsize='10%' strokecolor='#3AAEE0' fillcolor='#3AAEE0' > <w:anchorlock/><center style='color:#ffffff; font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size:16px;'> <![endif]--> <!--[if !mso]><!--><div style='color: #ffffff; background-color: #3AAEE0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; max-width: 186px; width: auto; border-top: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent; border-left: 0px solid transparent; padding-top: 5px; padding-right: 20px; padding-bottom: 5px; padding-left: 20px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; text-align: center;'><!--<![endif]--> <span style='font-size:16px;line-height:32px;'>MinuteMan.express</span> <!--[if !mso]><!--></div><!--<![endif]--> <!--[if mso]> </center> </v:roundrect> <![endif]--> </a> <div style='line-height:10px;font-size:1px'>&nbsp;</div></div> <div style='line-height: 5px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> </div></body></html>"
    
    var html = htmlfile1 + temphtml + htmlfile2;
    /*var emailData = {
                    "FromEmail": "online-confirmation@burda.co.th",
                    "FromName": "Minute System",
                    "Subject": "[Burda Minute]: " + req.body.title + "  [from : " + req.body.ownerEmail + "]",
                    "Html-part":html,
                    "To": toEmail.toString(),
                    "CC": ccEmail.toString(),
                }
    */
     var data = {
            from : 'confirmation@mg.minuteman.express',
            to : toEmail.toString() +"," +ccEmail.toString(),
            //cc : [ccEmail.toString()],
            subject : "[Burda Minute]: " + req.body.title + "  [from : " + req.body.ownerEmail + "]",
            html : html
    }
    /*sendMail.request(emailData)
    .then(result=>{
        res.json({ error: false, message: 'Send email already!' });
        html = null;
        emailData = null;
                    
    }).catch(err=> {
            console.log(err);
            res.json({ error: true, message: err });
    })*/
    mailgun.messages().send(data, function (error, body) {
        if(error){
            console.log(error);
            res.json({ error: true, message: error });
        }else{
            res.json({ error: false, message: 'Send email already!' });
            html = null;
            emailData = null;
        }
    });

});

router.post('/delete', function (req, res) {
    console.log("Call delete post");
    console.log(req.body.id);
    Minute.findOne({ 'id': req.body.id }, function (err, result) {
        if (err) {
            console.log(err);
            res.json({ error: true, message: err });
        } else {
            Session.findOne({ 'secret': req.cookies.secret }, function (err, user) {
                if (err) {
                    res.json({ error: true, message: err });
                } else {
                    console.log(result);
                    if (result.ownerEmail === user.email || user.email== 'admin@burda.com') {
                        Minute.remove({ 'id': req.body.id }, function (err) {
                            if (err) {
                                res.json({ error: true, message: err });
                            } else {
                                console.log("Remove the minute : " + req.body.id);
                                res.json({ error: false, message: "Already removed!" });
                            }
                        });
                    } else {
                        res.json({ error: false, message: "Permission denied!" });
                    }
                }
            })

        }
    })
});


router.post('/save', function (req, res) {
    var minute = new Minute();
    var data = null;
    var id = uuid.v4();
    minute.id = id;
    minute.title = req.body.title;
    minute.ownerEmail = req.body.ownerEmail;
    minute.description = req.body.description;
    minute.createDate = req.body.createDate;
    minute.attendeeEmail = req.body.attendees;
    minute.cc = req.body.cc;

    var toEmail = req.body.attendees.split(",");
    var ccEmail = req.body.cc.split(",");

    for (var i = 0; i < Object.keys(req.body.tasks).length; i++) {
        minute.tasks.push(req.body.tasks[i]);
    }
    minute.save(function (err) {
        if (err) {
            res.json({ 'error': true });
            console.log(err);
        } else {
            console.log('Save successfully!');
            res.json({ error: false, message: 'Save minute already!' });
        }
    });
})
router.post('/update', function (req, res) {
    var toEmail = req.body.attendees.split(",");
    var ccEmail = req.body.cc.split(",");
    Minute.findOne({ 'id': req.body.id }, function (err, result) {
        if (err) {
            console.log(err);
            res.json({ error: true, message: err });
        } else {
            if (result == null) {
                console.log("Not found");
                res.json({ error: false, message: 'Not found' });
            } else {
                console.log('Found and update');
                result.update({
                    "title": req.body.title,
                    "ownerEmail": req.body.ownerEmail,
                    "description": req.body.description,
                    "createDate": req.body.createDate,
                    "attendeeEmail": req.body.attendees,
                    "cc": req.body.cc,
                    "tasks": req.body.tasks
                }, function (err, done) {
                    if (err) {
                        res.json({ error: true, message: err });
                    } else {
                        console.log(done);
                        res.json({ error: false, message: "update data" });
                    }
                });
            }
        }
    });
})

router.post('/update/sendMail', function (req, res) {
    console.log('Update ')
    var toEmail = req.body.attendees.split(",");
    var ccEmail = req.body.cc.split(",");
    toEmail.push(req.body.ownerEmail);
    var temphtml = "<table style='width:100%;'><tr><td style='width:15%;'><center>Topic</center></td><td style='width:15%;'><center>Type</center></td><td style='width:40%;'><center>Note</center></td><td style='width:15%;'><center>Owner</center></td><td style='width:15%;'><center>Due</center></td></tr>";
    for (var i = 0; i < req.body.tasks.length; i++) {
         temphtml += "<tr><td class='column' style='width:15%;'><center>"+ req.body.tasks[i].topic+"</center></td><td class='column' style='width:15%;'><center>"+ req.body.tasks[i].type+"</center></td><td class='column' style='width:40%;'>"+req.body.tasks[i].note+"</td><td class='column' style='width:15%;'><center>"+req.body.tasks[i].owner+"</center></td><td class='column' style='width:15%;'><center>"+req.body.tasks[i].due+"</center></td></tr>";
    }
    temphtml += "</table>"
    

    var htmlfile1 = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD XHTML 1.0 Transitional //EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'><!--[if IE]><html xmlns='http://www.w3.org/1999/xhtml' class='ie-browser' xmlns:v='urn:schemas-microsoft-com:vml' xmlns:o='urn:schemas-microsoft-com:office:office'><![endif]--><!--[if !IE]><!--><html style='margin: 0;padding: 0;' xmlns='http://www.w3.org/1999/xhtml'><!--<![endif]--><head> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--> <meta http-equiv='Content-Type' content='text/html; charset=utf-8'> <meta name='viewport' content='width=device-width'> <!--[if !mso]><!--><meta http-equiv='X-UA-Compatible' content='IE=edge'><!--<![endif]--> <title>Template Base</title> <style type='text/css' id='media-query'> body { margin: 0; padding: 0; }table { border-collapse: collapse; table-layout: fixed; }* { line-height: inherit; }a[x-apple-data-detectors=true] { color: inherit !important; text-decoration: none !important; }.ie-browser .col, [owa] .block-grid .col { display: table-cell; float: none !important; vertical-align: top; }.ie-browser .num12, .ie-browser .block-grid, [owa] .num12, [owa] .block-grid { width: 500px !important; }.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }.ie-browser .mixed-two-up .num4, [owa] .mixed-two-up .num4 { width: 164px !important; }.ie-browser .mixed-two-up .num8, [owa] .mixed-two-up .num8 { width: 328px !important; }.ie-browser .block-grid.two-up .col, [owa] .block-grid.two-up .col { width: 250px !important; }.ie-browser .block-grid.three-up .col, [owa] .block-grid.three-up .col { width: 166px !important; }.ie-browser .block-grid.four-up .col, [owa] .block-grid.four-up .col { width: 125px !important; }.ie-browser .block-grid.five-up .col, [owa] .block-grid.five-up .col { width: 100px !important; }.ie-browser .block-grid.six-up .col, [owa] .block-grid.six-up .col { width: 83px !important; }.ie-browser .block-grid.seven-up .col, [owa] .block-grid.seven-up .col { width: 71px !important; }.ie-browser .block-grid.eight-up .col, [owa] .block-grid.eight-up .col { width: 62px !important; }.ie-browser .block-grid.nine-up .col, [owa] .block-grid.nine-up .col { width: 55px !important; }.ie-browser .block-grid.ten-up .col, [owa] .block-grid.ten-up .col { width: 50px !important; }.ie-browser .block-grid.eleven-up .col, [owa] .block-grid.eleven-up .col { width: 45px !important; }.ie-browser .block-grid.twelve-up .col, [owa] .block-grid.twelve-up .col { width: 41px !important; }@media only screen and (min-width: 520px) { .block-grid { width: 500px !important; } .block-grid .col { display: table-cell; Float: none !important; vertical-align: top; } .block-grid .col.num12 { width: 500px !important; } .block-grid.mixed-two-up .col.num4 { width: 164px !important; } .block-grid.mixed-two-up .col.num8 { width: 328px !important; } .block-grid.two-up .col { width: 250px !important; } .block-grid.three-up .col { width: 166px !important; } .block-grid.four-up .col { width: 125px !important; } .block-grid.five-up .col { width: 100px !important; } .block-grid.six-up .col { width: 83px !important; } .block-grid.seven-up .col { width: 71px !important; } .block-grid.eight-up .col { width: 62px !important; } .block-grid.nine-up .col { width: 55px !important; } .block-grid.ten-up .col { width: 50px !important; } .block-grid.eleven-up .col { width: 45px !important; } .block-grid.twelve-up .col { width: 41px !important; } }@media (max-width: 520px) { .block-grid, .col { min-width: 320px !important; max-width: 100% !important; } .block-grid { width: calc(100% - 40px) !important; } .col { width: 100% !important; } .col > div { margin: 0 auto; } img.fullwidth { max-width: 100% !important; } } </style></head><!--[if mso]><body class='mso-container' style='background-color:#FFFFFF;'><![endif]--><!--[if !mso]><!--><body class='clean-body' style='margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF'><!--<![endif]--> <div class='nl-container' style='min-width: 320px;Margin: 0 auto;background-color: #FFFFFF'> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid mixed-two-up'> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='333' style=' width:333px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num8' style='Float: left;min-width: 320px;max-width: 328px;width: 320px;width: calc(1800% - 9032px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='font-size:12px;line-height:14px;color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;text-align:left;'><p style='margin: 0;font-size: 12px;line-height: 14px'>&nbsp;<span style='font-size: 26px; line-height: 31px;'><strong>MinuteMan.express</strong></span></p><p style='margin: 0;font-size: 12px;line-height: 14px'><span style='font-size: 11px; line-height: 13px;'><span style='font-size: 11px; line-height: 13px;' id='_mce_caret' data-mce-bogus='true'>"+req.body.title+"&nbsp;</span><br data-mce-bogus='1'></span></p></div> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td><td align='center' width='167' style='; width:167px; padding-right: 10px; padding-left: 10px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num4' style='Float: left;max-width: 320px;min-width: 164px;width: 320px;width: calc(78164px - 15600%);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <!--[if !mso]><!--><div style='Margin-right: 10px; Margin-left: 10px;'><!--<![endif]--> <div></div> <!--[if !mso]><!--></div><!--<![endif]--> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid mixed-two-up'> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='167' style=' width:167px; padding-right: 10px; padding-left: 10px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num4' style='Float: left;max-width: 320px;min-width: 164px;width: 320px;width: calc(78164px - 15600%);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <!--[if !mso]><!--><div style='Margin-right: 10px; Margin-left: 10px;'><!--<![endif]--> <div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='font-size:12px;line-height:14px;color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;text-align:left;'><p style='margin: 0;font-size: 12px;line-height: 14px'><strong>Minute taker</strong></p><p style='margin: 0;font-size: 12px;line-height: 14px'><strong>Attendees</strong></p><p style='margin: 0;font-size: 12px;line-height: 14px'><strong>Others</strong></p></div> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <!--[if !mso]><!--></div><!--<![endif]--> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td><td align='center' width='333' style='; width:333px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num8' style='Float: left;min-width: 320px;max-width: 328px;width: 320px;width: calc(1800% - 9032px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 15px; font-size:1px'>&nbsp;</div> <div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='font-size:12px;line-height:14px;color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;text-align:left;'><p style='margin: 0;font-size: 12px;line-height: 14px'>"+req.body.ownerEmail+"</p><p style='margin: 0;font-size: 12px;line-height: 14px'>"+req.body.attendees+"</p><p style='margin: 0;font-size: 12px;line-height: 14px'>"+req.body.cc+"</p></div> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <div style='line-height: 15px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid '> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='500' style=' width:500px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num12' style='min-width: 320px;max-width: 500px;width: 320px;width: calc(18000% - 89500px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 5px; font-size:1px'>&nbsp;</div> <!--[if !mso]><!--><div align='center' style='Margin-right: 10px;Margin-left: 10px;'><!--<![endif]--> <div style='line-height: 10px; font-size:1px'>&nbsp;</div> <!--[if (mso)|(IE)]><table width='100%' align='center' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding-right: 10px;padding-left: 10px;'><![endif]--> <div style='border-top: 1px solid #BBBBBB; width:100%; font-size:1px;'>&nbsp;</div> <!--[if (mso)|(IE)]></td></tr></table><![endif]--> <div style='line-height:10px; font-size:1px'>&nbsp;</div><!--[if !mso]><!--></div><!--<![endif]-->"
    

    var htmlfile2 = "<div style='Margin-right: 10px; Margin-left: 10px;'> <div style='line-height: 10px; font-size: 1px'>&nbsp;</div><div style='line-height: 10px; font-size: 1px'>&nbsp;</div></div> <div style='line-height: 5px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> <div style='background-color:transparent;'> <div rel='col-num-container-box' style='Margin: 0 auto;min-width: 320px;max-width: 500px;width: 320px;width: calc(19000% - 98300px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;' class='block-grid '> <div style='border-collapse: collapse;display: table;width: 100%;'> <!--[if (mso)|(IE)]><table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td style='background-color:transparent;' align='center'><table cellpadding='0' cellspacing='0' border='0' style='width: 500px;'><tr class='layout-full-width' style='background-color:transparent;'><![endif]--> <!--[if (mso)|(IE)]><td align='center' width='500' style=' width:500px; padding-right: 0px; padding-left: 0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;' valign='top'><![endif]--> <div rel='col-num-container-box' class='col num12' style='min-width: 320px;max-width: 500px;width: 320px;width: calc(18000% - 89500px);background-color: transparent;'> <div style='background-color: transparent; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;'> <div style='line-height: 5px; font-size:1px'>&nbsp;</div> <div align='center' class='button-container center' style='Margin-right: 10px;Margin-left: 10px;'> <div style='line-height:10px;font-size:1px'>&nbsp;</div> <a href='https://minuteman.express/minute/"+req.body.id+"' target='_blank' style='color: #ffffff; text-decoration: none;'> <!--[if mso]> <v:roundrect xmlns:v='urn:schemas-microsoft-com:vml' xmlns:w='urn:schemas-microsoft-com:office:word' href='https://minuteman.express/minute/"+req.body.id+"' style='height:42px; v-text-anchor:middle; width:206px;' arcsize='10%' strokecolor='#3AAEE0' fillcolor='#3AAEE0' > <w:anchorlock/><center style='color:#ffffff; font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size:16px;'> <![endif]--> <!--[if !mso]><!--><div style='color: #ffffff; background-color: #3AAEE0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; max-width: 186px; width: auto; border-top: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid transparent; border-left: 0px solid transparent; padding-top: 5px; padding-right: 20px; padding-bottom: 5px; padding-left: 20px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; text-align: center;'><!--<![endif]--> <span style='font-size:16px;line-height:32px;'>MinuteMan.express</span> <!--[if !mso]><!--></div><!--<![endif]--> <!--[if mso]> </center> </v:roundrect> <![endif]--> </a> <div style='line-height:10px;font-size:1px'>&nbsp;</div></div> <div style='line-height: 5px; font-size: 1px'>&nbsp;</div> </div> </div> <!--[if (mso)|(IE)]></td></table></td></tr></table><![endif]--> </div> </div> </div> </div></body></html>"
    
    
    var html = htmlfile1 + temphtml + htmlfile2;
    Minute.findOne({ 'id': req.body.id }, function (err, result) {
        if (err) {
            console.log(err);
            res.json({ error: true, message: err });
        } else {
            if (result == null) {
                console.log("Not found");
                res.json({ error: false, message: 'Not found' });
            } else {
                console.log('Found and update');
                result.update({
                    "title": req.body.title,
                    "ownerEmail": req.body.ownerEmail,
                    "description": req.body.description,
                    "createDate": req.body.createDate,
                    "attendeeEmail": req.body.attendees,
                    "cc": req.body.cc,
                    "tasks": req.body.tasks
                }, function (err, done) {
                    if (err) {
                        res.json({ error: true, message: err });
                    } else {
                        console.log(done);
                        //sending the email
                        /*var emailData = {
                            "FromEmail": "online-confirmation@burda.co.th",
                            "FromName": "Minute System",
                            "Subject": "[Burda Minute updated]: " + req.body.title + "  [from : " + req.body.ownerEmail + "] ",
                            "Html-part":html,
                            "To": toEmail.toString(),
                            "CC": ccEmail.toString(),
                        }*/
                        var data = {
                                from : 'confirmation@mg.minuteman.express',
                                to : toEmail.toString() +"," +ccEmail.toString(),
                                //cc : [ccEmail.toString()],
                                subject : "[Burda Minute updated]: " + req.body.title + "  [from : " + req.body.ownerEmail + "] ",
                                html : html
                        }
                        /*sendMail.request(emailData)
                        .then(result=>{
                            res.json({ error: false, message: 'Send email already!' });
                            html = null;
                            emailData = null;
                                        
                        }).catch(err=> {
                                console.log(err);
                                res.json({ error: true, message: err });
                        })*/
                        mailgun.messages().send(data, function (error, body) {
                            if(error){
                                console.log(error);
                                res.json({ error: true, message: error });
                            }else{
                                res.json({ error: false, message: 'Send email already!' });
                                html = null;
                                emailData = null;
                            }
                        });
                    }
                });
            }
        }
    });

})

module.exports = router;