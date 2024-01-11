// const mongoose = require('mongoose')

// const dbURI = 'mongodb+srv://rajivpathak199:rajiv199@cluster0.m6krzpo.mongodb.net/angelLudo';

// module.exports=function dbConnection(){
// mongoose.connect(dbURI)
//     console.log("connected to database")
// }
 
// database 

const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://rajivpathak199:rajiv199@cluster0.m6krzpo.mongodb.net/angelLudo';

module.exports = function dbConnection() {
  mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const connection = mongoose.connection;

  connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  connection.once('open', () => {
    console.log('Connected to MongoDB');
  });
};
