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
    '/', 
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

        const { email, password,name } = req.body;

        try {
            // Check to see if there's a user with particular email
            let manager = await Manager.findOne({ email });

            if (manager) {
                return res.status(400).json({ msg: 'This admin exists already!'});
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

// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/orders', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const manager = await Manager.findById(req.managerUser.id).select('-password');

        if (manager) {
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


// Export
module.exports = router;