const mongoose = require('mongoose')

const dbURI = 'mongodb+srv://rajivpathak199:rajiv199@cluster0.m6krzpo.mongodb.net/angelLudo';

module.exports=function dbConnection(){
mongoose.connect(dbURI)
    console.log("connected to database")
}



    