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
  res.send("Admin");
});

router.get("/dashboard", async (req, res) => {
  if (req.session.isAuth) {
    console.log("Serving admin dashboard name = " + req.session.admin_name);
    const announcements = await announcementModel.find();
    console.log(announcements[0].announcement);

    var regis = await openRegistrationModel.find();
    var modifiedObjects = [];
    regis.forEach((obj) => {
      var modifiedObj = {
        _id: obj._id,
        dept: obj.dept,
        sem: obj.sem,
        startDate: obj.startDate.toDateString().slice(4),
        endDate: obj.endDate.toDateString().slice(4),
      };

      modifiedObjects.push(modifiedObj);
    });
    console.log(modifiedObjects);

    return res.render("adminDashboard.ejs", {
      announcements: announcements.reverse(),
      regis: modifiedObjects
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/makeAnnouncement", (req, res) => {
  const { announcement } = req.body;
  const newAnnouncement = new announcementModel({ announcement });
  newAnnouncement.save();
  res.redirect("/admin/dashboard");
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password, selectedLogo } = req.body;

  const user = await AdminModel.findOne({ email });
  const users = await AdminModel.find();
  console.log(users);
  console.log(user);

  if (!user) {
    console.log("User not found!!");
    return res.render("login.ejs", {
      isWarned: true,
      warnignMessage: "User account not found",
    });
  }

  if (user.password === password) {
    req.session.isAuth = true;
    req.session.admin_name = user.username;
    req.session.admin_email = user.email;
    res.redirect("/admin/dashboard");
  } else {
    console.log("Passwords don't match");
    return res.render("login.ejs", {
      isWarned: true,
      warnignMessage: "Wrong password",
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.render("login.ejs", { isWarned: false, warnignMessage: "none" });
  });
});

module.exports = router;