const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
var nodemailer = require('nodemailer');
const db = require('./db');
const MongoDBSession = require('connect-mongodb-session')(session);

dotenv.config({ path: './.env' });

const app = express();
const StudentModel = require('./models/student');
const PswdToken = require('./models/pswdToken');

const store = new MongoDBSession({
  uri: process.env.CONNECTION_STRING,
  collection: 'session'
});

const PORT = 5002;

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'joshuah.bartell57@ethereal.email',
      pass: 'TwMnY3yfspTJw3CfU4'
  }
});

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/styles', express.static('static/styles'));
app.use('/scripts', express.static('static/scripts'));

app.get('/', (req, res) => {
  res.send("Yokoso");
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/static/login.html');
});

app.get('/dashboard', (req, res) => {
  if (req.session.isAuth) {
    console.log("Serving dashboard name = " + req.session.student_email);
    res.render('dashboard.ejs', { name: req.session.student_email });
  } else {
    res.redirect('/login');
  }
});

app.post('/login', async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const user = await StudentModel.findOne({ email });

  if (!user) {
    console.log("User not found!!");
    return res.redirect('/login');
  }

  console.log(user);
  console.log(user.password);
  console.log(user.name);
  console.log(user.email);
  console.log(user.sem);

  if (user.password === password) {
    req.session.isAuth = true;
    req.session.student_name = user.name;
    req.session.student_email = user.email;
    req.session.student_sem = user.sem;
    res.redirect('/dashboard');
  } else {
    console.log("Passwords don't match");
    return res.redirect('/login');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
});

app.get('/forgotPassword', (req, res) => {
  res.sendFile(__dirname + '/static/forgotPassword.html');
});

app.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  
  function generateString(length) {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const str = generateString(5);

  try {
    const result = await PswdToken.create({email: email, token: str});
    console.log(`${result._id} document inserted`);
  } catch (e) {
    console.error(e);
  }

  const link = 'https://localhost:5002/resetPassword?email=' + email + '&token=' + str;
  
  var mailOptions = {
    from: 'mailvizzard@gmail.com',
    to: email,
    subject: 'Element password reset',
    text: 'Reset your password here: ' + link
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.redirect('/login');
});

app.port('/resetPassword', (req, res) => {
  const { email, token } = req.body;
})

app.get('/destroySession', (req, res) => {
  req.session.destroy((err) => {
    console.log("Destroying the session");
    if (err) throw err;
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});