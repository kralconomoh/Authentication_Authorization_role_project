const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');
require('dotenv').config()

// Admin user model
const AdminUser = require('../models/Admin');
const Manager = require('../models/Manager');
const Menu = require('../models/Menu');
const Order = require('../models/Order');


// @route       POST api/users/admin
// @desc        Register an admin based on if tutor has tutorId
// @accees      Public
router.post(
    '/', 
    [
        check('adminId', 'Admin ID is required to register as admin')
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

        const { adminId, email, password,name } = req.body;

        try {
            // Check to see if there's a user with particular email
            let adminUser = await AdminUser.findOne({ email });

            if (adminUser) {
                return res.status(400).json({ msg: 'This admin exists already!'});
            }

            adminUser = new AdminUser({
                adminId,
                email,
                password,
                name
            });

            // Encrypt password with bcrypt
            const salt = await bcrypt.genSalt(10);

            adminUser.password = await bcrypt.hash(password, salt);

            await adminUser.save();

            // Send response
            const payload = {
                adminUser: {
                    id: adminUser.id
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
router.get('/managers', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');

        if (adminUser) {
            // Find tutors admin
            const managers = await Manager.find({});
            // const tutorUsers = await TutorUser.find({ tutorUser: req.tutorUser });
        
            res.json(managers);
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
router.get('/manager/:id', auth, async (req, res) => {
    try {
        // Pull from database 

        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');

        if (adminUser) {
            // Find tutors admin
            const manager = await Manager.findById(req.params.id);

            res.json(manager);
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
router.put('/managers/:id', auth, async (req, res) => {
    try {

        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        console.log(adminUser);
        console.log(auth)
        
        if (adminUser) {
            // Find tutors admin
            let manager = await Manager.findById(req.params.id);

            if (!manager) return res.status(404).json({ msg: 'Manager not found' });

            let { isAdmin, isActive } = req.body;

            let managerFields = {};
        
            // Activate or Deactivate Tutor
            if (isActive) {
                managerFields.isActive = isActive;
            }

            // Set Admin status
            if (isAdmin) {
                managerFields.isAdmin = isAdmin;
            }
        
            // Update tutor status
            manager = await Manager.findByIdAndUpdate(req.params.id,
                { $set: managerFields },
                { new: true }  
            );

            
            res.json(manager);
        }
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// create a menu

// @route       PUT api/users/admin/tutors
// @desc        Super admin deactivates Tutor
// @accees      Private

router.post(
    '/menu', 
    [
        check('menu_type', 'Name is required to create a menu')
            .not()
            .isEmpty(),
        check('menu_items', 'items are required to create a menu')
            .not()
            .isEmpty()
    ],
    auth,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        
        const { menu_type,menu_items } = req.body;

        try {
            
            
        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');

        if (!adminUser) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });
        } 
            
            // Check to see if there's a menu with particular menu name
            let menu = await Menu.findOne({ menu_type });

            if (menu) {
                return res.status(400).json({ msg: 'This menu type exists already!'});
            }

            menu = new Menu({
                menu_type,
                menu_items
            });

            await menu.save()

            res.json(menu)

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// update a menu
// @route       PUT api/users/admin/tutors
// @desc        Super admin deactivates Tutor
// @accees      Private
router.put('/menus/:id', auth, async (req, res) => {
    try {

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');
        
        if (admin) {
            // Find tutors admin
            let menu = await Menu.findById(req.params.id);

            if (!menu) return res.status(404).json({ msg: 'Menu not found' });

            let { menu_type, menu_items } = req.body;

            let menuFields = {};
        
            // Activate or Deactivate Tutor
            if (menu_type) {
                staffFields.menu_type = menu_type;
            }

            // Set Admin status
            if (menu_items) {
                staffFields.menu_items = menu_items;
            }
        
            // Update tutor status
            menu = await Menu.findByIdAndUpdate(req.params.id,
                { $set: staffFields },
                { new: true }  
            );

            
            res.json(menu);
        }
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       GET api/users/admin/managers
// @desc        Super admin gets all orders
// @accees      Private
router.get('/orders', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (admin) {
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