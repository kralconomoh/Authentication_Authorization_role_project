const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/userAuth');
const { check, validationResult } = require('express-validator');
require('dotenv').config()

const User = require('../models/User');
const Menu = require('../models/Menu');
const Order = require('../models/Order');


// @route       POST api/users/customers
// @desc        Register a user
// @accees      Public
router.post(
    '/register', 
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
                    id: user.id,
                    email: user.email,
                    type: "CustomerUser"
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


// @route       GET /api/users/customer/info
// @desc        Get logged in customer info
// @accees      Private
router.get('/info', auth, async (req, res) => {
    // res.send('Get logged in customer info');

    try {
        // Get user from db
        const user = await User.findById(req.userUser.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route       POST /api/users/customer/login
// @desc        user get token (user logs in)
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
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // If there's a user, chech password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            // If it matches, send token
            const payload = {
                userUser: {
                    id: user.id,
                    email: user.email
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


// @route       GET api/users/customer/order
// @desc        User gets a orders by id
// @accees      Public
router.get('/order', auth, async (req, res) => {
    try {
        // Pull from database 
        const user = User.findById(req.userUser.id).select('-password')

        if (!user) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }
        const orders = await Order.find({email: user.email});


        if (!orders) return res.json({ msg: "No Orders Available" })

        res.json(orders);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       POST api/users/customers/orders/
// @desc        Customer User make an order
// @accees      Private
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
            
            console.log(menuType);

            let meal = menuType.menu_items.find(item => item.name == mealname)

            if (!meal) {
                return res.status(400).json({ msg: 'This Meal doesn\'t exists!'});
            }

            console.log(req.userUser);

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

// Reset Password
// @route       POST api/users/customers/reset-password/
// @desc        Super admin updates a menu
// @accees      Private
router.put('/reset-password', [
    check('email', 'Please add a valid email').isEmail(),
    check('password', 'Please enter a valid password with 6 or more characters')
        .isLength({ min: 6 }),
],  async (req, res) => {
    try {
        let {email, password} = req.body

        let user = await User.findOne({email}).select('-password');

        if (!user) {
            // Unauthorised
            return res.status(401).json({ msg: 'No Such User' });

        }

        const salt = await bcrypt.genSalt(10);

        password = await bcrypt.hash(password, salt);

        // Update the user
        user = await User.findByIdAndUpdate(user._id,
            { $set: {email,password}},
            { new: true }
        );

        res.json({msg:'Password Reset Successful!', user: {name:user.name, email:user.email}});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Export
module.exports = router;