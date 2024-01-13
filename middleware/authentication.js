const jwt = require('jsonwebtoken');
require('dotenv').config();

const username = process.env.ACCESSID;
const password = process.env.ACCESSPS;

const authentication = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized - No Authorization Header' });
    }
  
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    console.log('Received credentials:', credentials);
  
    const [user, pass] = credentials.split(':');
  
    if (user === username && pass === password) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized - Invalid Credentials' });
    }
};
  
module.exports = { authentication };



// const auth = (req, res, next) => {
//   const { authorization } = req.headers;
//   if (!authorization) {
//     res.status(401).send({ message: "Unauthorized" });
//   } else {
//     const [user, pass] = Buffer.from(authorization.split(" ")[1], "base64")
//       .toString()
//       .split(":");
//     if (user === username && pass === password) {
//       next();
//     } else {
//       res.status(401).send({ message: "Unauthorized" });
//     }
//   }
// };


// Authnticate using UserId

// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const secret = process.env.JWT_SECRET;

// const authentication = (req, res, next) => {
//   const authorization = req.headers.authorization;

//   if (!authorization) {
//     return res.status(401).send({ message: "Unauthorized" });
//   }

//   const token = authorization.split(" ")[1];

//   jwt.verify(token, secret, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: "Unauthorized" });
//     }
    
//     // You can access the decoded data like decoded.userId
//     req.userId = decoded.userId;
//     next();
//   });
// };

// module.exports = { authentication };
