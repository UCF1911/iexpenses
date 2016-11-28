var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    itemName:{type: String, required: true, index: true},
    categoryName:{type: String, required: true, index:true }
});

schema.index({itemName:1, categoryName:-1},{unique:true});
module.exports = mongoose.model('Item', schema);