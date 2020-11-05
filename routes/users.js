const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var nodemailer = require ('nodemailer');


// Load User model
const User = require('../model/User');
const { forwardAuthenticated } = require('../config/auth');
const { ensureAuthenticated } = require('../config/auth');

// Load Order model
const Order = require ('../model/Order');

// Login Page
router.get('/', function(req, res){
    res.render('login')
});


router.get ('/', forwardAuthenticated, function (req, res){
    res.render('login');
});

router.get('/report', ensureAuthenticated, function (req, res){
    res.render('index');
})

router.get('/menu', ensureAuthenticated, function (req, res){
    res.render('menu');
})

router.get('/order', ensureAuthenticated, function (req, res){
    res.render('order');
})

router.get('/home', ensureAuthenticated, function (req, res){
    res.render('home', {name: req.user.name});
})

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
         
        // Hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next); 
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out!');
  res.redirect('/');
});


// router.get('/history', ensureAuthenticated, function (req, res){
//   res.render('history');
// })

// Insert orders in database
router.post('/order', (req, res) => {
  const { name, day, curryType } = req.body;
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'maizagtl@gmail.com',
        pass: 'Cookiedough.12'
    }
  });
  let mailOptions = {
      from: '"Amirah Maiza Kabir" <maizagtl@gmail.com>', // sender address
      to: 'maizagtl@gmail.com',
      subject: 'Lunch Order', // Subject line
      text: req.body.day + req.body.date + req.body.name + req.body.curryType,
      // text: req.body.learnings,
      html: `<b>Day: </b>` + req.body.day + `         <b>Date: </b>` + req.body.date +  `<p> <b>Name: </b> </p>` + req.body.name + 
      `<p><b> Curry Type: </b></p>` + req.body.curryType // html body
  };

  transporter.sendMail(mailOptions, function(error, info){
      if (error) { 
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
      let errors = [];

      if (!day || !name || !curryType) {
        errors.push({ msg: 'Please enter all fields' });
      }
    
      if (errors.length > 0) {
        res.render('order', {
          errors,
          day,
          name,
          curryType
        });
      } else {
            const newOrder = new Order({
              day,
              name,
              curryType
            });
            
            newOrder.save (function (err){
              if (err) throw err;
              else{
                req.flash(
                'success_msg',
                  'Order placed!'
                );
                res.redirect('/order');
              }
            })
      }
  });
});

// Post order history in table
router.get ('/history', function (req, res){
  Order.find({}, function (err, orders){
    if (err){
      res.send("error");
    }
    else{
      res.render ('history', {
        orders: orders 
      });
    }
  });
});

module.exports = router;

