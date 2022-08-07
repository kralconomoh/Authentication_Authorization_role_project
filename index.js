const express = require('express');

const mongoose = require('mongoose');
require('dotenv').config();
const {MONGO_URI} = process.env;


// Initialise express
const app = express();


// Initialise Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.json({ msg: 'Hello world!'}));

// app.use((req, res) => {
//     req.userUser = {}
// })

app.use('/api/users/admin', require('./routes/adminUsers'));
app.use('/api/users/manager', require('./routes/manager'));
app.use('/api/users/staff', require('./routes/staff'));
app.use('/api/users/customer', require('./routes/user'));

app.use('/api/menus', require('./routes/menu'));
app.use('/api/orders', require('./routes/order'));




const PORT = process.env.PORT || 5000;

// Listen

mongoose
  .connect(process.env.MONGO_URI)
  .then((res) => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log("Your app is listening on port " + listener.address().port);
    });
  })
  .catch((err) => console.log(err));

