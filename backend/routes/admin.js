const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const db = require('../db');
const MongoDBSession = require('connect-mongodb-session')(session);

dotenv.config({path: '../.env'});

let router = express.Router();

const StudentModel = require('../models/student');
const PswdToken = require('../models/pswdToken');
const AdminModel = require('../models/admin');

const store = new MongoDBSession({
    uri: process.env.CONNECTION_STRING,
    collection: 'session'
});

router.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use('/styles', express.static('static/styles'));
router.use('/scripts', express.static('static/scripts'));
router.use('/images', express.static('static/images'));

router.get("/", (req, res) => {
    res.send("Admin");
});



module.exports = router;