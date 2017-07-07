var mongoose = require('mongoose');

var minute = mongoose.Schema({
    id : String,
    title: String,
    ownerEmail : String,
    attendeeEmail : String,
    cc : String,
    description : String,
    createDate : Date,
    tasks : [JSON]
});

module.exports = mongoose.model('minute',minute);