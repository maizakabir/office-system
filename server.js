//require all dependencies
var express = require ('express');
var bodyParser = require ('body-parser');
var path = require ('path');
var nodemailer = require ('nodemailer');
var mongo = require ('mongodb');
var mongoose = require ('mongoose');
var flash = require ('connect-flash');
var session = require ('express-session');
var passport = require ('passport');

//set server
var app = express();

//Passport config
require ('./config/passport')(passport);

//Express session middleware
app.use (session ({
    secret: 'secret',
    saveUninitialized: true,
    resave: true 
}));

//Connect flash
app.use (flash());

//Global variables
app.use(function(req, res, next){
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg');
   res.locals.error = req.flash('error');
   next();
});

//Connect to Mongo
mongoose.connect ('mongodb://localhost:27017/users', { useUnifiedTopology: true, useNewUrlParser: true })
    .then(()=> console.log ('MongoDB connected'))
    .catch (err => console.log (err));


var port = process.env.PORT || 3000;

//view engine EJS
app.set ('view engine', 'ejs');
//body-parser middleware
app.use (express.urlencoded({extended: false}));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

//static folder
app.use (express.static('public'));

//Passport Middleware
app.use (passport.initialize());
app.use (passport.session());

//Routes: users.js
app.use ('/', require ('./routes/users'));
app.use ('/report', require ('./routes/users'));
app.use ('/menu', require ('./routes/users'));
app.use ('/order', require ('./routes/users'));
app.use ('/register', require ('./routes/users'));
app.use ('/home', require ('./routes/users'));
app.use ('/history', require ('./routes/users'));

//Nodemailer: sending report
app.post('/send-email', function (req, res) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'maizagtl@gmail.com',
            pass: ''
        }
    });
    let mailOptions = {
        from: '"Amirah Maiza Kabir" <maizagtl@gmail.com>', // sender address
        to: req.body.to,
        // to: 'monir@gigatechltd.com', //req.body.to, // list of receivers
        subject: `Daily Report `,  //+ req.body.to, // Subject line
        text:  req.body.subject  + req.body.tasksAssigned + req.body.tasksCompleted,
        // text: req.body.learnings,
        html:  `<p> <b>Date: </b> </p>` + req.body.subject +  `<p> <b>Tasks Assigned: </b> </p>` + req.body.tasksAssigned +  
        `<p><b> Tasks Completed: </b></p>` + req.body.tasksCompleted + `<p><b> My Learnings: </b></p>` + req.body.learnings, // html body
    
    };
 
    transporter.sendMail(mailOptions, function(error, info){
        if (error) { 
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        req.flash(
            'success_msg',
              'Report submitted.'
            );
        res.redirect('/report');
    });
});

        
app.listen (port, function(req, res){
    console.log ('Server started', port); 
})