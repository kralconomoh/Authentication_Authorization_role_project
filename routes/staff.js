const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/staffAuth');
const { check, validationResult } = require('express-validator');
require('dotenv').config()

// Admin user model
const AdminUser = require('../models/Admin');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Order = require('../models/Order');


// @route       POST api/users/admin
// @desc        Register an admin based on if tutor has tutorId
// @accees      Public
router.post(
    '/', 
    [
        check('name', 'Name is required to register as a staff')
            .not()
            .isEmpty(),
        check('email', 'Please add a valid email').isEmail(),
        check('password', 'Please enter a valid password with 6 or more characters')
            .isLength({ min: 6 }),
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password,name } = req.body;

        try {
            // Check to see if there's a user with particular email
            let staff = await Staff.findOne({ email });

            if (staff) {
                return res.status(400).json({ msg: 'This admin exists already!'});
            }

            staff = new Staff({
                email,
                password,
                name
            });

            // Encrypt password with bcrypt
            const salt = await bcrypt.genSalt(10);

            staff.password = await bcrypt.hash(password, salt);

            await staff.save();

            // Send response
            const payload = {
                staffUser: {
                    id: staff.id
                }
            }

            jwt.sign(
                payload,
                process.env.jwtSecret,
                {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/users', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const staff = await Staff.findById(req.staffUser.id).select('-password');

        if (staff) {
            // Find tutors admin
            const users = await User.find({});
            // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });
        
            res.json(users);
        } else {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }


        // Find tutors admin
        // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });

        // res.json(tutorUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       GET api/users/admin/tutors
// @desc        Super admin gets tutors by id
// @accees      Private
router.get('/users/:id', auth, async (req, res) => {
    try {
        // Pull from database 

        const staff = await Staff.findById(req.staffUser.id).select('-password');

        if (staff) {
            // Find tutors admin
            const user = await User.findById(req.params.id);

            res.json(user);
        } else {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       PUT api/users/admin/tutors
// @desc        Super admin deactivates Tutor
// @accees      Private
router.put('/user/:id', auth, async (req, res) => {
    try {

        const staff = await Staff.findById(req.staffUser.id).select('-password');
        
        if (staff) {
            // Find tutors admin
            let user = await User.findById(req.params.id);

            if (!user) return res.status(404).json({ msg: 'User not found' });

            let { password } = req.body;

            let userFields = {};
        
            // Activate or Deactivate Tutor
            if (password) {
                userFields.password = password;
            }
        
            // Update tutor status
            user = await User.findByIdAndUpdate(req.params.id,
                { $set: userFields },
                { new: true }  
            );

            
            res.json(user);
        }
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/orders', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const staff = await Staff.findById(req.staffUser.id).select('-password');

        if (staff) {
            // Find tutors admin
            const orders = await Order.find({});
            // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });
        
            res.json(orders);
        } else {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }


        // Find tutors admin
        // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });

        // res.json(tutorUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/take-orders/:id', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const staff = await Staff.findById(req.staffUser.id).select('-password');

        if (staff) {
            // Find tutors admin
            const order = await Order.findById(req.params.id);
            
            if (!order) return res.status(404).json({ msg: 'Order not found' });

            let orderField = {isActive: false};

            order = await Order.findByIdAndUpdate(req.params.id,
                { $set: orderField },
                { new: true }  
            );

            res.json(order);
        } else {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }


        // Find tutors admin
        // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });

        // res.json(tutorUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});




// Export
module.exports = router;