var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var user = mongoose.Schema({
    email : String,
    password : String,
    isAdmin : Boolean,  
});
user.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
//To compare when user login with password
user.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
}
module.exports = mongoose.model('user',user);