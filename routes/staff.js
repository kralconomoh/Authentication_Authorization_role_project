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
    '/register', 
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
                return res.status(400).json({ msg: 'This staff exists already!'});
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


// @route       GET /api/users/manager/info
// @desc        Get logged in manager info
// @accees      Private
router.get('/info', auth, async (req, res) => {

    try {
        // Get student user from db
        const staff = await Staff.findById(req.staffUser.id).select('-password');
        res.json(staff);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route       POST /api/users/admin/login
// @desc        Auth user admin & get token (admin logs in)
// @access      Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        // res.send('Log in student');

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let staff = await Staff.findOne({ email });

            if (!staff) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // If there's a user, chech password
            const isMatch = await bcrypt.compare(password, staff.password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // If it matches, send token
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
router.get('/orders/:id', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const staff = await Staff.findById(req.staffUser.id).select('-password');

        if (staff) {
            // Find tutors admin
            const order = await Order.findById(req.params.id);
            // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });
        
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

// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/my-orders', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const staff = await Staff.findById(req.staffUser.id).select('-password');

        if (staff) {
            // Find tutors admin
            const orders = await Order.find({takenBy: staff.name});
        
            if (orders.length <= 0) return res.status(404).json({ msg: 'Order not found' });


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
            let order = await Order.findById(req.params.id);
            
            if (!order) return res.status(404).json({ msg: 'Order not found' });
            
            if (!order.isActive) return res.status(401).json({ msg: `Order has been taken by ${order.takenBy == staff.name ? 'You' : order.takenBy}` });

            let orderField = {isActive: false, takenBy: staff.name};

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