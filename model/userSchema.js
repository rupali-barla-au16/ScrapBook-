const mongoose = require('mongoose')
var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: String,
    ph_no: Number,
    images: [{
        image: String,
        title: String,
        caption: String
    }]
})

mongoose.model('user', userSchema)
module.exports = mongoose.model('user')