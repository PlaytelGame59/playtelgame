const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
   
    mobile_no: { type: String, required: true }, 
    email: { type: String, required: true }, 
    first_name: { type: String, required: true }, 
    device_type: { type: String, required: true }, 
    device_token: { type: String, required: true }, 
    user_type: { type: Number, required: true }, 
    password: { type: String, required: true },
})

const UserModel = mongoose.model("user", userSchema)

module.exports = { UserModel }     
