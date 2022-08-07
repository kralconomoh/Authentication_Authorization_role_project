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
const User = require('../models/User');
const Staff = require('../models/Staff');


// @route       POST api/users/admin
// @desc        Register an admin based on if tutor has tutorId
// @accees      Public
router.post(
    '/register', 
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
                    id: adminUser.id,
                    email: adminUser.email,
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

// @route       GET /api/users/admin/info
// @desc        Get logged in admin
// @accees      Private
router.get('/info', auth, async (req, res) => {
    // res.send('Get logged in admin');

    try {
        // Get student user from db
        const admin = await AdminUser.findById(req.adminUser.id).select('-password');
        res.json(admin);
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
            let admin = await AdminUser.findOne({ email });

            if (!admin) {
                return res.status(400).json({ msg: 'Invalid Credentials'});
            } 

            // If there's a user, chech password
            const isMatch = await bcrypt.compare(password, admin.password);

            if (!isMatch) {
                return res.status(400).json({msg: 'Invalid Credentials'});
            }

            // If it matches, send token
            const payload = {
                adminUser: {
                    id: admin.id,
                    email: admin.email,
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
            const managers = await Manager.find({}).select('-password');
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
router.get('/managers/:id', auth, async (req, res) => {
    try {
        // Pull from database 

        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');

        if (adminUser) {
            // Find tutors admin
            const manager = await Manager.findById(req.params.id).select('-password');

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

// @route       PUT api/users/admin/managers/<id>
// @desc        Super admin activates/deactivates Manager
// @accees      Private
router.put('/managers/:id', auth, async (req, res) => {
    try {

        const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        // console.log(adminUser);
        // console.log(auth)
        
        if (adminUser) {
            // Find tutors admin
            let manager = await Manager.findById(req.params.id).select('-password');

            if (!manager) return res.status(404).json({ msg: 'Manager not found' });

        
            // Update manager status
            manager = await Manager.findByIdAndUpdate(req.params.id,
                { $set: {...req.body} },
                { new: true }  
            );

            res.json(manager);
        }
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route       GET api/users/admin/managers
// @desc        Super admin gets all managers
// @accees      Private
router.get('/users', auth, async (req, res) => {
    try {
        // Pull from database 
        // const adminUser = await AdminUser.findById(req.adminUser.id).select('-password');
        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (admin) {
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

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (admin) {
            // Find admin
            const user = await User.findById(req.params.id).select('-password');

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

// @route       PUT api/users/admin/users/<id>
// @desc        Super admin deactivates Tutor
// @accees      Private
router.put('/users/:id', auth, async (req, res) => {
    try {

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');
        
        if (admin) {
            // Find admin
            let user = await User.findById(req.params.id).select('-password');

            if (!user) return res.status(404).json({ msg: 'User not found' });


            // Update tutor status
            user = await User.findByIdAndUpdate(req.params.id,
                { $set: {...req.body} },
                { new: true }  
            );

            
            res.json({user,msg:'User Updated!'});
        }
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete User
// @route       PUT api/users/admin/users/<id>
// @desc        Super admin deactivates Tutor
// @accees      Private
router.delete('/users/:id', auth, async (req, res) => {
    try {

        console.log('Hello');

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');
        
        if (admin) {
            // Find admin
            let user = await User.findById(req.params.id).select('-password');

            if (!user) return res.status(404).json({ msg: 'User not found' });


            // Update tutor status
            user = await User.findByIdAndDelete(req.params.id);

            
            res.json({msg:'User Deleted!'});
        }
        
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
        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (admin) {
            // Find tutors admin
            const staffs = await Staff.find({}).select('-password');
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

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (admin) {
            // Find tutors admin
            const staff = await Staff.findById(req.params.id).select('-password');

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

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (admin) {
            // Find tutors admin
            let staff = await Staff.findById(req.params.id);

            if (!staff) return res.status(404).json({ msg: 'Staff not found' });

            // Update tutor status
            staff = await Staff.findByIdAndUpdate(req.params.id,
                { $set: {...req.body} },
                { new: true }
            );


            res.json(staff);
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       PUT api/users/admin/staffs
// @desc        Super admin deelte staff
// @accees      Private
router.delete('/staffs/:id', auth, async (req, res) => {
    try {

        const admin = await AdminUser.findById(req.adminUser.id).select('-password');

        if (admin) {
            // Find tutors admin
            let staff = await Staff.findById(req.params.id);

            if (!staff) return res.status(404).json({ msg: 'Staff not found' });

            // Update tutor status
            staff = await Staff.findByIdAndDelete(req.params.id);


            res.json({msg:'Staff Deleted!'});
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Export
module.exports = router;