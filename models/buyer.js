var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    buyerName:{type: String, required: true, unique: true}
});

module.exports = mongoose.model('Buyer', schema);