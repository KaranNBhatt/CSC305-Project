var express = require('express');
var router = express.Router();
router.use(express.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.app.locals.db) {
    console.log('Got the database');
  }
  res.render('index', { title: 'Role Selection Form' });
});

/* Establishing Route to Homepage for Delete and Add refresh */
router.get('/homepage', function(req, res, next) {
  showHomepage(req, res, next);
});

router.post('/homepage', function(req, res, next) {
  clearReqAppLocals(req);
  req.app.locals.formdata = req.body;
  topLevel(req, res, next, req.body);
});

router.post('/student-add', function(req, res, next) {
  if (req.app.locals.db) {
    AddQuery(req, res, next); // Get Winter Courses
  }
  else {
    showHomepage(req, res, next);
  }
})

/* Student Delete Course Logic */
router.post('/delete-enrollment', function(req, res, next) {
  const { StdSSN, OfferNo } = req.body;
  if (req.app.locals.db) {
    const deleteQuery = "DELETE FROM Enrollment WHERE StdSSN = ? AND OfferNo = ?";
    req.app.locals.db.run(deleteQuery, [StdSSN, OfferNo], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error deleting enrollment');
        return;
      }
      console.log(`Deleted enrollment: StdSSN=${StdSSN}, OfferNo=${OfferNo}`);
      StdQuery(req, res, next); // Redirect to refresh the homepage with updated data
    });
  } else {
    res.status(500).send('Database not connected');
  }
});

router.post('/add-enrollment', function(req, res, next) {
  const { OfferNo, StdSSN } = req.body;
  if (req.app.locals.db) {
    const insertQuery = "INSERT INTO Enrollment (OfferNo, StdSSN) VALUES (?, ?)";
    req.app.locals.db.run(insertQuery, [OfferNo, StdSSN], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.error('Duplicate enrollment attempt.');
          res.status(400).send('Already enrolled in this course.');
        } else {
          console.error(err.message);
          res.status(500).send('Error adding enrollment');
        }
        return;
      }
      console.log(`Added enrollment: StdSSN=${StdSSN}, OfferNo=${OfferNo}`);
      StdQuery(req, res, next); // Redirect to refresh the homepage with updated data
    });
  } else {
    res.status(500).send('Database not connected');
  }
});


/* Top Level Query */
function topLevel(req, res, next) {
  if (req.app.locals.formdata.role === 'faculty') {
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
  else if (req.app.locals.formdata.role === 'registrar') {
    req.app.locals.query = "SELECT * FROM Offering";
    req.app.locals.db.all(req.app.locals.query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.courses = rows;
      RegQuery(req, res, next);
    });
  }
}

/* Faculty Homepage Query */
function FacQuery(req, res, next) {
  if (req.app.locals.formdata && req.app.locals.formdata.userID) {
    // Not Normalized because DB doesn't use dashes for Faculty
    req.app.locals.userID = SSN_with_dashes(req.app.locals.formdata.userID);
    let querySSN = req.app.locals.formdata.userID
    
    let paramQuery = "SELECT CourseNo, OffTerm, OffYear FROM Offering WHERE FacSSN = ?"
    req.app.locals.db.all(paramQuery, [querySSN], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.paramQuery = paramQuery
      req.app.locals.courses = rows;
      showHomepage(req, res, next);
    });
  }
  else {
    showHomepage(req, res, next);
  }
}

/* Student Homepage Query */
function StdQuery(req, res, next) {
  if (req.app.locals.formdata && req.app.locals.formdata.userID) {
    // Normalize the SSN to have Dashes since in DB Student does
    req.app.locals.userID = SSN_with_dashes(req.app.locals.formdata.userID);
    let querySSN = req.app.locals.userID;
    
    let paramQuery = `SELECT o.offerNo, o.CourseNo, o.OffTerm, o.OffYear, e.EnrGrade,  FacFirstName || ' ' || FacLastName as ProfessorName `
                      + `FROM Enrollment e `
                      + `JOIN Offering o ON e.OfferNo = o.OfferNo `
                      + `LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN `
                      + `WHERE StdSSN = ?`
    req.app.locals.db.all(paramQuery, [querySSN], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.courses = rows;
      showHomepage(req, res, next);
    });
  }
  else {
    showHomepage(req, res, next);
  }
}

/* Registrar Query */
function RegQuery(req, res, next) {
  if (req.app.locals.formdata) {
    let paramQuery = `SELECT OfferNo, CourseNo, FacFirstName || ' ' || FacLastName as ProfessorName, OffLocation, OffTime, OffDays `
                    + `FROM Offering o `
                    + `LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN `
                    + `WHERE OffTerm = "WINTER"`
    req.app.locals.db.all(paramQuery, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.courses = rows;
      
      showHomepage(req, res, next);
    });
  }
  else {
    showHomepage(req, res, next);
  }
}

/* Student Add Query */
function AddQuery(req, res, next) {
  if (req.app.locals.formdata) {
    let paramQuery = `SELECT OfferNo, CourseNo, FacFirstName || ' ' || FacLastName as ProfessorName, OffLocation, OffTime, OffDays ` 
                    + `FROM Offering o ` 
                    + `LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN ` 
                    + `WHERE OffTerm = "WINTER"`
    req.app.locals.db.all(paramQuery, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.courses = rows;

      showStudentAdd(req, res, next);
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
                          userID: req.app.locals.userID,
                          role: req.app.locals.formdata.role,
                          formdata: req.app.locals.formdata,
  })
}

function showStudentAdd(req, res, next) {
  res.render('student-add', { title: 'Add Course',
    rows: req.app.locals.rows,
    courses: req.app.locals.courses,
    userID: req.app.locals.userID,
    role: req.app.locals.formdata.role,
    formdata: req.app.locals.formdata,
})
}
 
module.exports = router;