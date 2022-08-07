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
const User = require('../models/User');
const Menu = require('../models/Menu');
const Order = require('../models/Order');


// @route       POST api/users/admin
// @desc        Register an admin based on if tutor has tutorId
// @accees      Public
router.post(
    '/', 
    [
        check('name', 'Name is required to register as a Customer User')
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
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ msg: 'This User exists already!'});
            }

            user = new User({
                email,
                password,
                name
            });

            // Encrypt password with bcrypt
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // Send response
            const payload = {
                userUser: {
                    id: user.id
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
router.get('/menus', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const user = await User.findById(req.userUser.id).select('-password');

        if (user) {
            // Find tutors admin
            const menus = await Menu.find({});
            // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });
        
            res.json(menus);
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
router.get('/menus/:id', auth, async (req, res) => {
    try {
        // Pull from database 

        const user = await User.findById(req.userUser.id).select('-password');

        if (user) {
            // Find tutors admin
            const menu = await Menu.findById(req.params.id);

            res.json(menu);
        } else {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post(
    '/orders', 
    auth, 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { usermail, mealname, mealId,menu_type } = req.body;

        try {
            // Check to see if there's a user with particular email
            let menuType = await Menu.findOne({ menu_type });

            let meal = menuType.find(item => item.name == mealname)

            if (!meal) {
                return res.status(400).json({ msg: 'This Meal doesn\'t exists!'});
            }

            let order = new Order({
                mealname,
                menu_type,
                mealId:meal.id,
                usermail: req.userUser.email
            });

            // Save order
            await order.save();

            res.json({msg:'Order Placed!', order})

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// Export
module.exports = router;