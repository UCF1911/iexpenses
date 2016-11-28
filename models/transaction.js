var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    itemName:{type: String, required: true},
    categoryName:{type: String, required: true},
    quantity:{type: Number},
    priceEach:{type: Number},
    priceWhole:{type: Number},
    buyerName:{type: String, required: true},
    date:{type:Date, default:Date.now}
});

module.exports = mongoose.model('Transaction', schema);