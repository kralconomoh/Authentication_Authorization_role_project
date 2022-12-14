/** 
 * This checks to see if there's a token and header
 */
 const jwt = require('jsonwebtoken');
 require('dotenv').config()
 
 module.exports = function(req, res, next) {
     // Get token from header
     const token = req.header('x-auth-token');
 
     // Check if no token exists
     if (!token) {
         return res.status(401).json({ msg: 'No token, authorisation denied'});
     }
 
     
 
     // If there's a token
     try {
         const decoded = jwt.verify(token, process.env.jwtSecret);
         
         // Admin user model
         // Check if user is admin
         // If admin ... return req.adminUser
         // else 
         // err - user not an admin
 
         // Assign user to request object
         req.userUser = decoded.userUser;
 
 
         // if (token && req.adminUser === undefined) {
         //     console.log(req.adminUser)
         //     return res.status(401).json({ msg: 'Unauthorised User' });
         // } 
         
 
         // console.log(req);
 
         
 
         next();
     } catch (err) {
         res.status(401).json({ msg: 'Token is not valid' });
     }
 }