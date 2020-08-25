/*
var path            = require('path');
const db = require('better-sqlite3')('statCorona.db');
// Create table if doesn't exist
db.prepare('CREATE TABLE IF NOT EXISTS visitors (visits integer)').run();
// Insert the visits row if doesn't exist
selectResults = db.prepare('SELECT visits FROM visitors').get();
if (!selectResults) db.prepare('INSERT INTO visitors (visits) VALUES (0)').run();

let visitNbrs = db.prepare('SELECT visits FROM visitors').get().visits;
let updateVisitByOne = db.prepare('UPDATE visitors SET visits = visits + 1;');
*/


// Opens App Routes
module.exports = function(app) {
  // Dependencies
  /*app.get('/visits', async function(req, res) {
    res.json({visits: visitNbrs});
  });

  app.get('/', async function(req, res) {
    if (req && req.headers && req.headers['user-agent']) console.log(req.headers['user-agent']);
    else console.log("visit without UA info");

    console.log("visits: " + (++visitNbrs));
    updateVisitByOne.run();

    res.sendFile(path.join(__dirname + '../../../public/homepage.html'));
  });*/
};
