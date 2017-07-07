var mongoose  = require('mongoose');
var bcrypt = require('bcrypt-nodejs');


var tempUser = mongoose.Schema({
    id : String,
    email : String,
    password : String
});
tempUser.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
//To compare when user login with password
tempUser.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
}
module.exports = mongoose.model('TempUser',tempUser);