module.exports = function (app, shopData) {

        const bcrypt = require('bcrypt'); //importing bcrypt
        const saltRounds = 10;//converts a plain password to a unique value that is difficult to reverse

        const redirectLogin = (req, res, next) => {
          if (!req.session.userId) {
            res.redirect("./login");
          } else {
            next();
          }
        };

        // Handle our routes
        app.get('/', function (req, res) {
            res.render('index.ejs', {
                shopName: shopData.shopName,
                loggedin: req.session.loggedin
            }) 
        });

        app.get('/about',  function (req, res) {
            res.render('about.ejs', shopData);
        });
        app.get('/search', function (req, res) {
            res.render("search.ejs", shopData);
        });
        app.get('/search-result', function (req, res) {
            //searching in the database
            //res.send("You searched for: " + req.query.keyword);

            let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
            // execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./');
                }
                let newData = Object.assign({}, shopData, {
                    availableBooks: result
                });
                console.log(newData)
                res.render("list.ejs", newData)
            });
        });
        app.get('/register', function (req, res) { //handle a new user registration form
            res.render('register.ejs', shopData);
        });
        app.post('/registered', function (req, res) {
            // saving data in database
                let sqlquery = "INSERT INTO users (first_name, last_name, email, username, password) VALUES (?,?,?,?,?)";
            // execute sql query
                let data = {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    username: req.body.username,
                    password: req.body.password
                }

                bcrypt.hash(data['password'], saltRounds, (err, hashedPassword) => { //hashing plain password
                    if (err) {
                        return console.error(err.message);
                    }

                    // submitting query with a hashed password 
                    let record = [data['first_name'], data['last_name'], data['email'], data['username'], hashedPassword] 

                    db.query(sqlquery, record, (err, result) => {
                        if (err) {
                            return console.error(err.message);
                        } else
                            res.redirect('./')
                    });

                });
            });

        app.get('/list',redirectLogin, function (req, res) {
            let orderBy = req.query.orderBy
            let sqlquery = "SELECT * FROM books ORDER BY author ASC";
            console.log("Order By", orderBy)
            if (orderBy === "DESC") {
                sqlquery = "SELECT * FROM books ORDER BY author DESC"
            }
            // let sqlquery = "SELECT * FROM books ORDER BY author ASC"; // query database to get all the books
            // execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./');
                }
                let newData = Object.assign({}, shopData, {
                    availableBooks: result
                }, {
                    orderBy: orderBy
                });
                console.log(newData)
                res.render("list.ejs", newData)
            });
        });

        app.get('/users', function (req, res) { // handle registered user list
            // Get the users from the database
            let query = "SELECT id, first_name, last_name, email, username FROM users"

            // Execute the query
            db.query(query, (err, result) => {

                if (err) {
                    // Print the error
                    console.error(err)

                    // Redirect to home screen
                    res.redirect("./")
                }

                let users = result

                // Render the view with the users as a variable
                res.render('users.ejs', {
                    shopData,
                    users
                });
            })
        });

        app.get('/deleteuser', function (req, res, error = false) {
            // Render the deletion page
            res.render('deleteuser.ejs', {
                shopData
            });
        })

        app.post('/deleteuser', function (req, res) {
            let query = "DELETE FROM users WHERE username='" + req.body.username + "'"; // deleting user from database

            db.query(query, (err, result) => {
                if (err) {
                    // Print the error
                    console.error(err)

                    // Redirect to home
                    res.redirect("./")
                }
                if (result.length == 0) {
                    res.render("views/deleteuser.ejs", {
                        error: "User does not exist"
                    })
                } else {
                    let query = "DELETE FROM users WHERE username='" + req.body.username + "'";
                    db.query(query, (err, result) => {
                        if (err) {
                            console.log("Error", err)
                            return res.redirect("./")
                        }

                        res.redirect('users')
                    })
                }
            })

        })
        app.get('/login',function (req, res) {
            // check if user is logged in
            if(req.session.loggedin) {
              // redirect
              res.redirect("./");
            
            } else {
           
              res.render("login.ejs", {
                shopData,
                shopName: shopData.shopName,
              });
            }
        })

        app.post('/loggedin', function (req, res) {
            let data = {
                username: req.body.username,
                password: req.body.password
            }

            let query = "SELECT * FROM users WHERE username='" + data.username + "'"; // selecting user from database by username

            db.query(query, (err, result) => {

                if (err) {

                    // Print the error
                    console.error(err)

                    // Redirect to home
                    res.redirect("/index.ejs")
                }

                console.log("result", result)
                console.log("data", data)
                if (result.length == 0) {

                    res.render("login.ejs", {
                        error : "User does not exist", shopName:shopData.shopName
                    })
                } else {

                    bcrypt.compare(data.password.toString(), result[0].password.toString(), (err, hashed) => {
                      // Save user session here, when login is successful
                     // req.session.userId = req.body.username;
                      //The compare function simply pulls the salt out of the
                      // hash and then uses it to hash the password and perform the comparison

                      if (err) {
                        return console.error(err);
                      }

                      if (hashed) {
                        req.session.loggedin = result[0]; // save user data into a session
                        // render index page with session
                        res.redirect("./");
                      }
                    })
                }
            })
        })

        app.get('/addbook', function (req, res) {
            res.render('addbook.ejs', shopData);
        });

        app.post('/bookadded', function (req, res) {
            // saving data in database
            let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";

            // execute sql query
            let newrecord = [req.body.name, req.body.price];
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                else res.send(' This book is added to database, name: ' + req.body.name + ' price ' + req.body.price);
            });
        });

        app.get('/bargainbooks', function (req, res) {
                        let sqlquery = "SELECT * FROM books WHERE price < 20";
                        db.query(sqlquery, (err, result) => {
                            if (err) {
                                res.redirect('./');
                            }
                            let newData = Object.assign({}, shopData, {
                                availableBooks: result
                            });
                            console.log(newData)
                            res.render("bargains.ejs", newData)
                        });
                    });
                }
