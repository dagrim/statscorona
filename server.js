// Dependencies
// -----------------------------------------------------
var express         = require('express');
const compression = require('compression')
var server_port     = process.env.OPENSHIFT_NODEJS_PORT || 80
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var path            = require('path');
var app             = express();

// SQLite Configuration
// -----------------------------------------------------
const db = require('better-sqlite3')('statCorona.db');
// Create table if doesn't exist
db.prepare('CREATE TABLE IF NOT EXISTS visitors (visits integer)').run();
// Insert the visits row if doesn't exist
selectResults = db.prepare('SELECT visits FROM visitors').get();
if (!selectResults) db.prepare('INSERT INTO visitors (visits) VALUES (0)').run();

// Express Configuration
// -----------------------------------------------------
// Logging and Parsing
/*if (process.env.MODE === "production") {
    app.use(express.static(__dirname + '/public_min'));             // if minized version exists, serves it
} else {
    app.use(express.static(__dirname + '/public'));                 // sets the static files location to public
}*/
app.use(compression());
app.use(express.static(__dirname + '/public'));                 // sets the static files location to public
app.use('/bower_components',  express.static(__dirname + '/bower_components')); // Use BowerComponents
app.use(morgan('dev'));                                         // log with Morgan
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({extended: true}));               // parse application/x-www-form-urlencoded
app.use(bodyParser.text());                                     // allows bodyParser to look at raw text
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(methodOverride());

let visitNbrs = db.prepare('SELECT visits FROM visitors').get().visits;
let updateVisitByOne = db.prepare('UPDATE visitors SET visits = visits + 1;');

app.get('/visits', async function(req, res) {
    res.json({visits: visitNbrs});
});

app.get('/', async function(req, res) {
    if (req && req.headers && req.headers['user-agent']) console.log(req.headers['user-agent']);
    else console.log("visit without UA info");

    console.log("visits: " + (++visitNbrs));
    updateVisitByOne.run();

    res.sendFile(path.join(__dirname + '/public/homepage.html'));
});

// Routes
// ------------------------------------------------------
//require('./app/routes/routes.js')(app);

// Listen
// -------------------------------------------------------
app.listen(server_port, function () {
    console.log( "Listening on port " + server_port )
});
