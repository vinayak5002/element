const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const db = require("../db");
const MongoDBSession = require("connect-mongodb-session")(session);

dotenv.config({ path: "../.env" });

let router = express.Router();

const StudentModel = require("../models/student");
const PswdToken = require("../models/pswdToken");
const AdminModel = require("../models/admin");
const announcementModel = require("../models/announcement");
const openRegistrationModel = require("../models/openRegistrations");

const store = new MongoDBSession({
    uri: process.env.CONNECTION_STRING,
    collection: "session",
});

router.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use("/styles", express.static("static/styles"));
router.use("/scripts", express.static("static/scripts"));
router.use("/images", express.static("static/images"));

router.get("/", (req, res) => {
    res.send("Yokoso, Student ye");
});

router.get('/dashboard', (req, res) => {
    if (req.session.isAuth) {
        console.log("Serving dashboard name = " + req.session.student_name);
        res.render('students/dashboard.ejs', { name: req.session.student_name });
    } else {
        res.redirect("/login");
    }
});

router.get("/selectElective", async (req, res) => {
    const currentDate = new Date();
    const studentDept = req.session.student_dept;
    const studentSem = req.session.student_sem;
    const registration = await openRegistrationModel.findOne({ dept: studentDept, sem: studentSem });
    const allregis = await openRegistrationModel.find();

    var serve;

    if( registration ){
        const endDate = registration.endDate;
        if( currentDate <= endDate ){
            serve = true;
        }else{
            serve = false;
        }
    }
    else{
        serve = false;
    }
    console.log("Serving decision = "+serve);

    if( !serve ){
        console.log("Rendering without content");
        res.render("students/selectElective.ejs", { isRegisOpen: false });
    }

    if (req.session.isAuth) {
        console.log("Department name = " + req.session.student_dept);
        res.render('students/selectElective.ejs', { isRegisOpen: true });
    } else {
        res.redirect("/login");
    }
});

module.exports = router;