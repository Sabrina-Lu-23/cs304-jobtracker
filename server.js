// start app with 'npm run dev' in a terminal window
// go to http://localhost:port/ to view your deployment!
// every time you change something in server.js and save, your deployment will automatically reload

// to exit, type 'ctrl + c', then press the enter key in a terminal window
// if you're prompted with 'terminate batch job (y/n)?', type 'y', then press the enter key in the same terminal

// standard modules, loaded from node_modules
const path = require('path');
require("dotenv").config({ path: path.join(process.env.HOME, '.cs304env')});
const express = require('express');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const flash = require('express-flash');
const multer = require('multer');


// our modules loaded from cwd

const { Connection } = require('./connection');
const cs304 = require('./cs304');

// Create and configure the app

const app = express();

// Morgan reports the final status code of a request's response
app.use(morgan('tiny'));

app.use(cs304.logStartRequest);

// This handles POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cs304.logRequestData);  // tell the user about any request data
app.use(flash());


app.use(serveStatic('public'));
app.set('view engine', 'ejs');

const mongoUri = cs304.getMongoUri();

app.use(cookieSession({
    name: 'session',
    keys: ['horsebattery'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ================================================================
// custom routes here

const DBNAME = "jobtrack";
const APPLICATIONS = "applications";
const USERS = "users";
const ROUNDS = 15;
const REVIEWS = "reviews";

// ================================================================
// LOGIN / SIGNUP Page

// main page
app.get('/', (req, res) => {
    return res.render("login.ejs", {
        info: req.flash('info'),
        error: req.flash('error')
    });
});

// signup page
app.get('/signup', (req, res) => {
  req.flash('info', 'Password must be 6-18 characters long and contain only letters and numbers.');
  return res.render("signup.ejs", {
      info: req.flash('info'),
      error: req.flash('error')
  });
});

function isValidPassword(password) {
    const regex = /^[A-Za-z0-9]{6,18}$/; // passwords must be 6-18 characters with only numbers and letters
    return regex.test(password);
}

// register
app.post("/join", async (req, res) => {
  try {
      const {
          name, email, phone, targetJob, jobType, school, major,
          username, password
      } = req.body;
      // required fields check
      if (!name || !email || !phone || !targetJob || !jobType || !username || !password) {
        req.flash('error', "Please fill out all required fields.");
        return res.redirect('/signup');
      }
      // password validation
      if (!isValidPassword(password)) {
          req.flash('error', "Password must be 6-18 characters long and only letters and numbers.");
          return res.redirect('/signup');
      }
      const db = await Connection.open(mongoUri, DBNAME);
      const existingUser = await db.collection(USERS).findOne({ username: username });
      if (existingUser) {
          req.flash('error', "Username already exists - login or choose another username.");
          return res.redirect('/signup');
      }
      const hash = await bcrypt.hash(password, ROUNDS);
      await db.collection(USERS).insertOne({
          name: name,
          email: email,
          phone: phone,
          targetJob: targetJob,
          jobType: jobType,
          school: school || null,  // store null if empty
          major: major || null,
          username: username,
          hash: hash
      });
      req.flash('info', 'Successfully registered and logged in as ' + username);
      req.session.username = username;
      req.session.loggedIn = true;
      return res.redirect('/profile');
  } catch (error) {
      req.flash('error', `Error registering: ${error}`);
      return res.redirect('/signup');
  }
});

// login
app.post("/login", async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      // required fields check
      if (!username || !password) {
        req.flash('error', "Please fill out username and password.");
        return res.redirect('/login');
      }
      // password validation check
      if (!isValidPassword(password)) {
        req.flash('error', "Invalid password format. Password must be 6-18 characters long and contain only letters and numbers.");
        return res.redirect('/');
      }
      const db = await Connection.open(mongoUri, DBNAME);
      var existingUser = await db.collection(USERS).findOne({username: username});
      if (!existingUser) {
        req.flash('error', "Username does not exist.");
       return res.redirect('/')
      }
      const match = await bcrypt.compare(password, existingUser.hash); 
      if (!match) {
          req.flash('error', "Username or password incorrect.");
          return res.redirect('/')
      }
      req.flash('info', 'successfully logged in as ' + username);
      req.session.username = username;
      req.session.loggedIn = true;
      return res.redirect('/profile');
    } catch (error) {
      req.flash('error', `Error logging in: ${error}`);
      return res.redirect('/')
    }
  });

// logout
app.post('/logout', (req,res) => {
    if (req.session.username) {
      req.session.username = null;
      req.session.loggedIn = false;
      req.flash('info', 'You are logged out.');
      return res.redirect('/');
    } else {
      req.flash('error', `Error logging out: ${error}`);
      return res.redirect('/');
    }
  });

function requiresLogin(req, res, next) {
  if (!req.session.loggedIn) {
    req.flash('error', 'This page requires you to be logged in.');
    return res.redirect("/");
  } else {
      next();
  }
}

// ================================================================
// RROFILE Page

// profile
app.get('/profile', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);
  const user = await db.collection(USERS).findOne({ username: req.session.username });
  if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/');
  }
  return res.render('profile.ejs', {
      user: user,
      error: req.flash('error'),
      info: req.flash('info')
  });
});

// render edit profile page
app.get('/profile/edit', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);
  const user = await db.collection(USERS).findOne({ username: req.session.username });
  if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/profile');
  }

  res.render('editProfile.ejs', {
      user: user,
      info: req.flash('info'),
      error: req.flash('error')
  });
});

// update profile
app.post('/profile/update', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);
  const updatedInfo = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      targetJob: req.body.targetJob,
      jobType: req.body.jobType,
      school: req.body.school || null,
      major: req.body.major || null
  };

  try {
      await db.collection(USERS).updateOne(
          { username: req.session.username },
          { $set: updatedInfo }
      );
      req.flash('info', 'Profile updated successfully.');
      res.redirect('/profile');
  } catch (error) {
      req.flash('error', `Error updating profile: ${error}`);
      res.redirect('/profile/edit');
  }
});



// ================================================================
// REVIEW PAGE

// main reviews page
app.get('/reviews', async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);

  const q = req.query.q;
  let filter = {};

  if (q) {
    filter = {
      $or: [
        { company: { $regex: q, $options: 'i' } },
        { job: { $regex: q, $options: 'i' } }
      ]
    };
  }

  const reviews = await db.collection(REVIEWS).find(filter).toArray();

  res.render('review.ejs', {
    reviews: reviews,
    info: req.flash('info'),
    error: req.flash('error'),
    q: q 
  });
});

// add a new review
app.post('/reviews/add', requiresLogin, async (req, res) => {
  const {
    company, job, salary, rating,
    ratingWorkLife, ratingCompensation, ratingCulture, ratingCareerGrowth,
    review
  } = req.body;

  if (!company || !job || !rating || !review ||
      !ratingWorkLife || !ratingCompensation || !ratingCulture || !ratingCareerGrowth) {
    req.flash('error', 'Please fill out all required fields.');
    return res.redirect('/reviews');
  }

  const db = await Connection.open(mongoUri, DBNAME);
  const date = new Date().toISOString().split('T')[0];

  const newReview = {
    username: req.session.username,
    company,
    job,
    salary: salary ? Number(salary) : null,
    rating: Number(rating), 
    ratings: {
      workLife: Number(ratingWorkLife),
      compensation: Number(ratingCompensation),
      culture: Number(ratingCulture),
      careerGrowth: Number(ratingCareerGrowth)
    },
    review,
    date
  };

  await db.collection(REVIEWS).insertOne(newReview);
  req.flash('info', 'Review added successfully.');
  res.redirect('/reviews');
});


// ================================================================
// TRACKER PAGE

// job application tracker page
app.get('/tracker', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);

  // get search keyword
  const q = req.query.q;
  const sort = req.query.sort || 'asc';

  let filter = { username: req.session.username };
  if (q) {
    filter.$or = [
        { jobTitle: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } }
    ];
  }

  const sortOrder = (sort === 'desc') ? -1 : 1;

  const applications = await db
  .collection(APPLICATIONS)
  .find(filter)
  .sort({ dateApplied: sortOrder })
  .toArray();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);

  const upcomingDeadlines = await db.collection(APPLICATIONS).find({
    username: req.session.username,
    deadline: {
      $gte: today,
      $lt: end
    }
  }).sort({ deadline: 1 }).toArray();

  return res.render('tracker.ejs', { 
    applications,
    upcomingDeadlines,
    q,
    sort,
    info: req.flash('info'),
    error: req.flash('error') 
  });

});

app.get('/applications/new', requiresLogin, (req, res) => {
  return res.render('newApplication.ejs', {
    info: req.flash('info'),
    error: req.flash('error')
  });
});


// add a job application
app.post('/applications/add', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);

  const {
    jobTitle, company, status, location, dateApplied, deadline
  } = req.body;
  
  if (!jobTitle || !company || !status || !location || !dateApplied || !deadline) {
    req.flash('error', 'Please fill out all required fields.');
    return res.redirect('/applications/new');
  }

  const lastApp = await db.collection(APPLICATIONS)
  .find({ username: req.session.username })
  .sort({ applicationId: -1 })
  .limit(1)
  .toArray();
  const nextId = lastApp.length > 0 ? lastApp[0].applicationId + 1 : 10000001;

  const normalizeToStartOfDay = (dateStr) => {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const data = {
    applicationId: nextId,
    username: req.session.username,
    jobTitle,
    company,
    status,
    location,
    dateApplied: normalizeToStartOfDay(dateApplied),
    deadline: normalizeToStartOfDay(deadline)
  };
  try {
    await db.collection(APPLICATIONS).insertOne(data);
    req.flash('info', 'Application added successfully!');
  } catch (error) {
    req.flash('error', 'Failed to add application.');
  }
  return res.redirect('/tracker');
});

// delete a job application
app.post('/applications/delete/:id', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);
  try {
    await db.collection(APPLICATIONS).deleteOne({ 
      applicationId: parseInt(req.params.id), 
      username: req.session.username
    });
    req.flash('info', 'Application deleted successfully!');
  } catch (error) {
    req.flash('error', 'Failed to delete application.');
  }
  return res.redirect('/tracker');
});

app.get('/applications/edit/:id', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);
  const appId = parseInt(req.params.id);

  const application = await db.collection(APPLICATIONS).findOne({ 
    applicationId: appId,
    username: req.session.username
  });

  if (!application) {
    req.flash('error', 'Application not found.');
    return res.redirect('/tracker');
  }

  return res.render('edit.ejs', { 
    application,
    info: req.flash('info'),
    error: req.flash('error')
   });
});

app.post('/applications/update/:id', requiresLogin, async (req, res) => {
  const db = await Connection.open(mongoUri, DBNAME);
  const appId = parseInt(req.params.id);

  const {
    jobTitle, company, status, location, dateApplied, deadline
  } = req.body;
  
  if (!jobTitle || !company || !status || !location || !dateApplied || !deadline) {
    req.flash('error', 'Please fill out all required fields.');
    return res.redirect('/applications/edit/' + req.params.id);
  }

  const updatedData = {
    jobTitle,
    company,
    status,
    location,
    dateApplied: new Date(dateApplied),
    deadline: new Date(deadline)
  };

  try {
    await db.collection(APPLICATIONS).updateOne(
      { applicationId: appId, username: req.session.username },
      { $set: updatedData }
    );
    req.flash('info', 'Application updated successfully!');
  } catch (error) {
    req.flash('error', 'Failed to update application.');
  }
  return res.redirect('/tracker');
});



// ================================================================
// postlude

const serverPort = cs304.getPort(8080);

// this is last, because it never returns
app.listen(serverPort, function() {
    console.log(`open http://localhost:${serverPort}`);
});