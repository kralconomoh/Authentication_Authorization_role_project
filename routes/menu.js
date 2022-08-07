const express = require('express');
const router = express.Router();
// const config = require('config');
const auth = require('../middleware/AdminAuth');
const { check, validationResult } = require('express-validator');

const Menu = require('../models/Menu');
const AdminUser = require('../models/Admin');

// @route       GET /api/menus
// @desc        User gets all menus
// @access      Public
router.get('/', auth, async (req, res) => {
    // Get menus from db
    try {
        const menus = await Menu.find({}).sort({ date: -1 });

        if (!menus) return res.json({ msg: "No Menu Available" });

        res.json(menus);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       GET api/menus/<id>
// @desc        User gets a menu by id
// @accees      Public
router.get('/:id', async (req, res) => {
    try {
        // Pull from database 
        const menu = await Menu.findById(req.params.id);

        if (!menu) return res.json({ msg: "No Menu Available" })

        res.json(menu);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// create a menu

// @route       PUT api/users/menu
// @desc        Super admin deactivates Tutor
// @accees      Private

router.post(
    '/',
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

        const { menu_type, menu_items } = req.body;

        try {

            const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');

            if (!adminUser) {
                // Unauthorised
                return res.status(401).json({ msg: 'Not authorized' });
            }

            // Check to see if there's a menu with particular menu name
            let menu = await Menu.findOne({ menu_type });

            if (menu) {
                return res.status(400).json({ msg: 'This menu type exists already!' });
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
// @route       PUT api/menus/<id>
// @desc        Super admin updates a menu
// @accees      Private
router.put('/:id', auth, async (req, res) => {
    try {

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (!admin) {
            // Unauthorised
            return res.status(401).json({ msg: 'Not authorized' });

        }
        // Find a menu
        let menu = await Menu.findById(req.params.id);

        if (!menu) return res.status(404).json({ msg: 'Menu not found' });
        // Update the menu
        menu = await Menu.findByIdAndUpdate(req.params.id,
            { $set: {...req.body}},
            { new: true }
        );


        res.json(menu);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Export
module.exports = router;