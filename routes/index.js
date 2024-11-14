var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.app.locals.db) {
    console.log('Got the database');
  }
  res.render('index', { title: 'Express' });
});

router.post('/homepage', (req, res, next) => {
  const {userID, role} = req.body;
  res.render('homepage', {userID, role});
})

module.exports = router;