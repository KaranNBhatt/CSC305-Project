const sqlite3 = require('sqlite3');

const dbopen = (dbpath) => {
    let db = new sqlite3.Database(dbpath, (err) => {
        if (err) {
            console.error(err.message);
            throw err;
        }
        else {
            console.info('Connected to database ' + dbpath);
        }
    });
    return db;
};

const dbclose = (db, afterCloseCallback) => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection');
        afterCloseCallback();
    });
};

module.exports = {dbopen, dbclose};