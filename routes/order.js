const express = require('express');
const router = express.Router();
// const config = require('config');
const auth = require('../middleware/AdminAuth');
const { check, validationResult } = require('express-validator');

const Order = require('../models/Order');
const AdminUser = require('../models/Admin');
const Manager = require('../models/Manager');
const Staff = require('../models/Staff');
const Customer = require('../models/User');

// @route       GET /api/orders
// @desc        User gets all orders
// @access      Public
router.get('/', auth, async (req, res) => {
    // Get orders from db
    try {

        if (!req.adminUser) {
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
router.get('/:id', auth, async (req, res) => {
    try {
        // Pull from database 
        const order = await Order.findById(req.params.id);

        if (req.userUser && req.userUser.email !== order.usermail) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (!order) return res.json({ msg: "No Order Available" })

        res.json(order);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// create a order

// @route       POST api/orders/
// @desc        Super admin or CustomerUser creates a Order
// @accees      Private

router.post(
    '/',
    [auth,
        [
            check('mealname', 'Name of meal is required').not().isEmpty(),
            check('menu_type', 'Type of menu is required').not().isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.adminUser?.id) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { usermail, mealname, mealId, menu_type } = req.body;

        try {
            // Check to see if there's a user with particular email
            let menuType = await Menu.findOne({ menu_type });

            let meal = menuType.find(item => item.name == mealname)

            if (!meal) {
                return res.status(400).json({ msg: 'This Meal doesn\'t exists!' });
            }

            let order = new Order({
                mealname,
                menu_type,
                mealId: meal.id,
                usermail: req.adminUser.email
            });

            // Save order
            await order.save();

            res.json({ msg: 'Order Placed!', order })

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// update an order
// @route       PUT api/order/<id>
// @desc        Super admin updates an order
// @accees      Private
router.put('/:id', auth, async (req, res) => {
    try {

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (!admin) {
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

// delete an order
// @route       PUT api/order/<id>
// @desc        Super admin deletes an order
// @accees      Private
router.delete('/orders/:id', auth, async (req, res) => {
    try {

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (!admin) {
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