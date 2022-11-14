// Import the modules we need
let express = require ('express')
let ejs = require('ejs')
let bodyParser= require ('body-parser')
const mysql = require('mysql');
var session = require('express-session')

// Create the express application object
const app = express()
const port = 8000
app.use(bodyParser.urlencoded({ extended: true }))

app.enable('trust proxy')

// Create a session
app.use(
  session({
    name: "sid",
    secret: "uhirfg4w3giy4et3itg4397gr439u", //This is the secret used to sign the session ID cookie.
    resave: false, //resave option as an example,express-session will store the session automatically
    // if the session has been altered, because we set resave: false in the session middleware.
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // 2 hours, this is the maximum age of the cookie,
    },
  })
);

// Set up css
app.use(express.static(__dirname + '/public'));

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'appuser',
    password: 'app2027',
    database: 'myBookshop'
});


// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;


// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine('html', ejs.renderFile);

// Define our data
let shopData = {shopName: "Bertie's Books"}

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, shopData);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
