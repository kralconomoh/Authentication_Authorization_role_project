const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/managerAuth');
const { check, validationResult } = require('express-validator');
require('dotenv').config()

// Admin user model
const AdminUser = require('../models/Admin');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');
const Order = require('../models/Order');


// @route       POST api/users/admin
// @desc        Register an admin based on if tutor has tutorId
// @accees      Public
router.post(
    '/register',
    [
        check('name', 'Name is required to register as a manager')
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

        const { email, password, name } = req.body;

        try {
            // Check to see if there's a user with particular email
            let manager = await Manager.findOne({ email });

            if (manager) {
                return res.status(400).json({ msg: 'This manager exists already!' });
            }

            manager = new Manager({
                email,
                password,
                name
            });

            // Encrypt password with bcrypt
            const salt = await bcrypt.genSalt(10);

            manager.password = await bcrypt.hash(password, salt);

            await manager.save();

            // Send response
            const payload = {
                managerUser: {
                    id: manager.id
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
    // res.send('Get logged in admin');

    try {
        // Get student user from db
        const manager = await Manager.findById(req.managerUser.id).select('-password');
        res.json(manager);
    } catch (err) {
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
            let manager = await Manager.findOne({ email });

            if (!manager) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // If there's a user, chech password
            const isMatch = await bcrypt.compare(password, manager.password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // If it matches, send token
            const payload = {
                managerUser: {
                    id: manager.id
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
        const manager = await Manager.findById(req.managerUser.id).select('-password');

        if (manager) {
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

// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/staffs', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const manager = await Manager.findById(req.managerUser.id).select('-password');

        if (manager) {
            // Find tutors admin
            const staffs = await Staff.find({});
            // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });

            res.json(staffs);
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
router.get('/staffs/:id', auth, async (req, res) => {
    try {
        // Pull from database 

        const manager = await Manager.findById(req.managerUser.id).select('-password');

        if (manager) {
            // Find tutors admin
            const staff = await Staff.findById(req.params.id);

            res.json(staff);
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
router.put('/staffs/:id', auth, async (req, res) => {
    try {

        const manager = await Manager.findById(req.managerUser.id).select('-password');

        if (manager) {
            // Find tutors admin
            let staff = await Staff.findById(req.params.id);

            if (!staff) return res.status(404).json({ msg: 'Staff not found' });

            let { isManager, isActive } = req.body;

            let staffFields = {};

            // Activate or Deactivate Tutor
            if (isActive) {
                staffFields.isActive = isActive;
            }

            // Set Admin status
            if (isManager) {
                staffFields.isManager = isManager;
            }

            // Update tutor status
            staff = await Staff.findByIdAndUpdate(req.params.id,
                { $set: staffFields },
                { new: true }
            );


            res.json(staff);
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       GET /api/orders
// @desc        User gets all orders
// @access      Public
router.get('/orders/', auth, async (req, res) => {
    // Get orders from db
    try {
        console.log();
        if (!req.managerUser) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const orders = await Order.find({}).sort({ date: -1 });

        if (!orders) return res.json({ msg: "No Orders Available" });

        res.json(orders);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       GET api/orders/<id>
// @desc        User gets a orders by id
// @accees      Public
router.get('/orders/:id', auth, async (req, res) => {
    try {
        // Pull from database 
        const order = await Order.findById(req.params.id);

        if (!req.managerUser) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (!order) return res.json({ msg: "Order Not Available" })

        res.json(order);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/orders/:id', auth, async (req, res) => {
    try {

        const manager = await Manager.findById(req.managerUser.id).select('-password');

        if (!manager) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });

        }
        // Find a menu
        let order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ msg: 'Order not found' });

        // Update the order
        order = await Order.findByIdAndUpdate(req.params.id,
            // { $set: staffFields },
            { $set: {...req.body} },
            { new: true }
        );


        res.json(order);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/orders/:id', auth, async (req, res) => {
    try {

        const manager = await Manager.findById(req.managerUser.id).select('-password');

        if (!manager) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });

        }
        // Find a menu
        let order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ msg: 'Order not found' });

        // Delete the order
        order = await Order.findByIdAndDelete(req.params.id);


        res.json({msg:'Deleted Successfully'});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// Export
module.exports = router;