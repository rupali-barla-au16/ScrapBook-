const mongoose = require('mongoose')
var photoSchema = new mongoose.Schema({
    image:String,
    title:String,
    caption:String

})

mongoose.model('photo',photoSchema)
module.exports = mongoose.model('photo')