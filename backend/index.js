const express = require('express');
const session = require('express-session');
const db = require('./db');
const MongoDBSession = require('connect-mongodb-session')(session);
const app = express();

const StudentModel = require('./models/student')

const connectionString = 'mongodb+srv://vizz:vizzard@cluster0.jni7dnx.mongodb.net/element?retryWrites=true&w=majority';

const store = new MongoDBSession({
  uri : connectionString,
  collection : 'session'
})

const PORT = 5002;

app.set('view engine', 'html');

app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/styles', express.static('static/styles'));

app.get('/', (req, res) => {
  res.send("Yokoso");
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/static/login.html');
});

app.get('/dashboard', (req, res) => {
  if(req.session.isAuth){
    // res.sendFile(__dirname + '/static/dashboard.html');
    console.log("serving dashboard name = "+req.session.student_email);
    res.render('dashboard.ejs', { name: req.session.student_email });
  }
  else{
    res.redirect('/login');
  }
});

app.post('/login', async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const user = await StudentModel.findOne({email});

  if(!user){
    console.log("usernot found!!");
    return res.redirect('/login');
  }

  console.log(user)
  console.log(user.password);
  console.log(user.name);
  console.log(user.email);
  console.log(user.sem);

  
  if(user.password == password){
    req.session.isAuth = true;
    req.session.student_name = user.name;
    req.session.student_email = user.email;
    req.session.student_sem = user.sem;
    // console.log("saving session name = " + user.name);
    res.redirect('/dashboard');
  }
  else{
    consolge.log("passwords doesn't match")
    return res.redirect('/login');
  }
})

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
})

app.listen(PORT, () => {
  console.log("Listening on port ${PORT}");
});