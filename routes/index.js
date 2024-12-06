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

/* Establishing Route to View Course for Update Enrollement Grade Refresh */
router.get('/view-course', function(req, res, next) {
  showViewCourse(req, res, next);
});

router.post('/homepage', function(req, res, next) {
  clearReqAppLocals(req);
  req.app.locals.formdata = req.body;
  topLevel(req, res, next, req.body); // Takes Role/ID and Displays Correct Homepage
});

/* Displays Add Courses Page */
router.post('/student-add', function(req, res, next) {
  if (req.app.locals.db) {
    AddQuery(req, res, next); // Get Winter Courses
  }
  else {
    showHomepage(req, res, next);
  }
});

/* Display Registrar Add Page */
router.post('/registrar-add', function(req, res, next) {
  if (req.app.locals.db) {
    RegAddQuery(req, res, next); // Get Courses
  }
  else {
    showHomepage(req, res, next);
  }
})

/* Displays Students in Course */
router.post('/view-course', function(req, res, next) {
  if (req.app.locals.db) {
    ViewQuery(req, res, next); // Get Students in Course
  }
  else {
    showHomepage(req, res, next);
  }
});

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

      StdQuery(req, res, next); // Query the Student Query again to Refresh the Page Correctly
    });
  } else {
    res.status(500).send('Database not connected');
  }
});

/* Student Add Course Logic */
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

      StdQuery(req, res, next); // Query the Student Query again to Refresh the Page Correctly
    });
  } else {
    res.status(500).send('Database not connected');
  }
});

/* Student Edit Grade Logic */
router.post('/edit-grade', function(req, res, next){
  const { OfferNo, StdSSN, EnrGrade } = req.body;
  if (req.app.locals.db) {
    const updateQuery = "UPDATE Enrollment SET EnrGrade = ? WHERE OfferNo = ? AND StdSSN = ?";

    req.app.locals.db.run(updateQuery, [EnrGrade, OfferNo, StdSSN], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error updating grade');
        return;
      }
      console.log(`Updated grade: OfferNo=${OfferNo}, StdSSN=${StdSSN}, EnrGrade=${EnrGrade}`);

      ViewQuery(req, res, next); // Query the View Query again to Refresh the Page Correctly
    });
  } else {
    res.status(500).send('Database not connected');
  }
});



/* Registrar Edit Course Logic */
router.post('/registrar-edit', function(req, res, next) {
  const { OfferNo, CourseNo, FacSSN, OffLocation, OffTime, OffDays } = req.body;

  if (req.app.locals.db) {
    const updateQuery = "UPDATE Offering SET FacSSN = ?, OffLocation = ?, OffTime = ?, OffDays = ? WHERE OfferNo = ? AND CourseNo = ?"

    req.app.locals.db.run(updateQuery, [FacSSN, OffLocation, OffTime, OffDays, OfferNo, CourseNo], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error updating grade');
        return;
      }

      console.log(`Updated Offering: OfferNo=${OfferNo}, CourseNo=${CourseNo}, FacSSN=${FacSSN}, OffLocation=${OffLocation}, OffTime=${OffTime}, OffDays=${OffDays}`);
      
      RegQuery(req, res, next); // Query the Registrar Query again to Refresh the Page Correctly
    });  
  } else {
    res.status(500).send('Database not connected');
  }
});

router.post('/delete-offering', function(req, res, next) {
  const { OfferNo } = req.body;

  if (req.app.locals.db) {
    const deleteQuery = "DELETE FROM Offering WHERE OfferNo = ?";

    req.app.locals.db.run(deleteQuery, [OfferNo], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error deleting enrollment');
        return;
      }
      console.log(`Deleted Offering: OfferNo=${OfferNo}`);

      RegQuery(req, res, next); // Query the Student Query again to Refresh the Page Correctly
    });
  } else {
    res.status(500).send('Database not connected');
  }
});

router.post('/registrar-add-form', function(req, res, next) {
  const { OfferNo, CourseNo, OffTerm, OffYear, FacSSN, OffLocation, OffTime, OffDays} = req.body;

  if (req.app.locals.db) {
    const insertQuery = "INSERT INTO Offering (OfferNo, CourseNo, OffTerm, OffYear, FacSSN, OffLocation, OffTime, OffDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"

    req.app.locals.db.run(insertQuery, [OfferNo, CourseNo, OffTerm, OffYear, FacSSN, OffLocation, OffTime, OffDays], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.error('Duplicate offer attempt.');
          res.status(400).send('Already Offering this course.');
        } else {
          console.error(err.message);
          res.status(500).send('Error adding offer');
        }
      }

      console.log(`Inserted into Offering: OfferNo=${OfferNo}, CourseNo=${CourseNo}, OffLocation=${OffLocation}, OffTime=${OffTime}, OffDays=${OffDays}`);
      
      RegQuery(req, res, next); // Query the Registrar Query again to Refresh the Page Correctly
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

      ProfQuery(req, res, next);
      RegQuery(req, res, next); // Get Courses for Upcoming Term
    });
  }
}

/* Faculty Homepage Query */
function FacQuery(req, res, next) {
  if (req.app.locals.formdata && req.app.locals.formdata.userID) {
    req.app.locals.userID = SSN_with_dashes(req.app.locals.formdata.userID); // Normalize the SSN with Dashes for Homepage

    let querySSN = req.app.locals.formdata.userID // Use Dashless to Query DB
    
    let paramQuery = "SELECT OfferNo, CourseNo, OffTerm, OffYear FROM Offering WHERE FacSSN = ?"
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

/* Student Homepage Query */
function StdQuery(req, res, next) {
  if (req.app.locals.formdata && req.app.locals.formdata.userID) {
    req.app.locals.userID = SSN_with_dashes(req.app.locals.formdata.userID); // Normalize the SSN with Dashes

    let querySSN = req.app.locals.userID; // Use Dashes to Query DB
    
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

/* Registrar Homepage Query */
function RegQuery(req, res, next) {
  if (req.app.locals.formdata) {
    let paramQuery = `SELECT OfferNo, CourseNo, o.FacSSN, FacFirstName || ' ' || FacLastName as ProfessorName, OffLocation, OffTime, OffDays `
                    + `FROM Offering o `
                    + `LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN `
                    + `WHERE OffTerm = "WINTER" AND OffYear = 2025`
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

function ProfQuery(req, res, next) {
  req.app.locals.query = "SELECT FacSSN, FacFirstName || ' ' || FacLastName as ProfessorName FROM Faculty";

  req.app.locals.db.all(req.app.locals.query, [], (err, rows) => {
    if (err) {
      throw err;
    }
    req.app.locals.professors = rows;
  });
}

/* Student Add Query */
function AddQuery(req, res, next) {
  if (req.app.locals.formdata) {
    let paramQuery = `SELECT OfferNo, CourseNo, FacFirstName || ' ' || FacLastName as ProfessorName, OffLocation, OffTime, OffDays ` 
                    + `FROM Offering o ` 
                    + `LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN ` 
                    + `WHERE OffTerm = "WINTER" AND OffYear = 2025`
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

/* View Students in Course Query */
function ViewQuery(req, res, next) {
  if (req.app.locals.formdata) {
    req.app.locals.OfferNo = req.body.OfferNo;

    let OfferNo = req.app.locals.OfferNo;
    let querySSN = req.app.locals.formdata.userID;

    let paramQuery = `SELECT StdFirstName || ' ' || StdLastName as Student, s.StdSSN, EnrGrade ` 
                    + `FROM Offering o ` 
                    + `JOIN Enrollment e ON o.OfferNo = e.OfferNo ` 
                    + `JOIN Student s ON e.StdSSN = s.StdSSN ` 
                    + `WHERE o.OfferNo = ? and FacSSN = ?`
    req.app.locals.db.all(paramQuery, [OfferNo, querySSN], (err, rows) => {
      if (err) {
        throw err;
      }
        req.app.locals.courses = rows;
                
        showViewCourse(req, res, next);
    });
  }
  else {
    showHomepage(req, res, next);
  }
}

function RegAddQuery(req, res, next) {
  if (req.app.locals.formdata) {
    req.app.locals.query = "SELECT * FROM Course"

    req.app.locals.db.all(req.app.locals.query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.courses = rows;

      showRegistrarAdd(req, res, next);
    });
  } else {
    showHomepage(req, res, next);
  }
}

function clearReqAppLocals(req) {
  req.app.locals.query = '';
  req.app.locals.userID = '';
  req.app.locals.paramQuery = '';
  req.app.locals.OfferNo = '';
  req.app.locals.courses = [];
  req.app.locals.rows = [];
  req.app.locals.professors = [];
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

/* Role Based Homepage */
function showHomepage(req, res, next) {
  res.render('homepage', { title: 'Homepage',
                          rows: req.app.locals.rows,
                          courses: req.app.locals.courses,
                          professors: req.app.locals.professors,
                          userID: req.app.locals.userID,
                          role: req.app.locals.formdata.role,
  })
}

/* View Courses as Student to Add */
function showStudentAdd(req, res, next) {
  res.render('student-add', { title: 'Add Course',
                              rows: req.app.locals.rows,
                              courses: req.app.locals.courses,
                              userID: req.app.locals.userID,
                              role: req.app.locals.formdata.role,
  })
}

/* View Students in a Course as Faculty to Add */
function showViewCourse(req, res, next) {
  res.render('view-course', { title: 'View Course',
                              rows: req.app.locals.rows,
                              courses: req.app.locals.courses,
                              userID: req.app.locals.userID,
                              offerNo: req.app.locals.OfferNo,
  })
}

function showRegistrarAdd(req, res, next) {
  res.render('registrar-add', { title: 'Registrar Add',
                              rows: req.app.locals.rows,
                              courses: req.app.locals.courses,
  })
}
 
module.exports = router;