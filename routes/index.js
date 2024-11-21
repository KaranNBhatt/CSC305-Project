var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.app.locals.db) {
    console.log('Got the database');
  }
  res.render('index', { title: 'Express' });
});

router.post('/homepage', function(req, res, next) {
  clearReqAppLocals(req);
  req.app.locals.formdata = req.body;
  console.log(req.app.locals.formdata.role);
  topLevel(req, res, next, req.body);
});

function topLevel(req, res, next) {
  if (req.app.locals.formdata.role === 'faculty') {
    console.log('Form data: ' + JSON.stringify(req.app.locals.formdata));
    req.app.locals.query = "SELECT * FROM Faculty;";
    req.app.locals.db.all(req.app.locals.query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.rows = rows;
      FacQuery(req, res, next);
    });
  }
  else if (req.app.locals.formdata.role === 'student') {
    req.app.locals.query = "SELECT * FROM Student;";
    req.app.locals.db.all(req.app.locals.query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.rows = rows;
      StdQuery(req, res, next);
    });
  }
  else {
    showHomepage(req, res, next);
  }
}

function clearReqAppLocals(req) {
  req.app.locals.query = '';
  req.app.locals.rows = [];
  req.app.locals.userID = '';
  req.app.locals.paramQuery = '';
  req.app.locals.courses = [];
  req.app.locals.formdata = {};
}

function FacQuery(req, res, next) {
  if (req.app.locals.formdata && req.app.locals.formdata.userID) {
    // Not Normalized because DB doesn't use dashes for Faculty
    let querySSN = req.app.locals.formdata.userID
    
    let paramQuery = "SELECT * FROM Offering WHERE FacSSN = ?"
    req.app.locals.db.all(paramQuery, [querySSN], (err, rows) => {
      req.app.locals.paramQuery = paramQuery
      req.app.locals.courses = rows;

      showHomepage(req, res, next);
    });
  }
  else {
    showHomepage(req, res, next);
  }
}

function StdQuery(req, res, next) {
  if (req.app.locals.formdata && req.app.locals.formdata.userID) {
    // Normalize the SSN to have Dashes since in DB Student does
    req.app.locals.userID = SSN_with_dashes(req.app.locals.formdata.userID);
    let querySSN = req.app.locals.userID;
    
    let paramQuery = "SELECT * FROM Enrollment WHERE StdSSN = ?"
    console.log(paramQuery);
    req.app.locals.db.all(paramQuery, [querySSN], (err, rows) => {
      req.app.locals.paramQuery = paramQuery
      req.app.locals.courses = rows;
      showHomepage(req, res, next);
    });
  }
  else {
    showHomepage(req, res, next);
  }
}

function SSN_with_dashes(ssn) {
  if (ssn.at(3) != '-') {
    ssn = ssn.slice(0, 3) + '-' + ssn.slice(3);
  }
  if (ssn.at(6) != '-') {
    ssn = ssn.slice(0, 6) + '-' + ssn.slice(6);
  }
  return ssn;
}

function showHomepage(req, res, next) {
  res.render('homepage', { title: 'Homepage',
                          rows: req.app.locals.rows,
                          courses: req.app.locals.courses,
                          userID: req.app.locals.formdata.userID,
                          role: req.app.locals.formdata.role,
                          formdata: req.app.locals.formdata,
  })
}

module.exports = router;