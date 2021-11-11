const { response } = require('express');
const http = require('http'); 
const express = require('express'); 
const app = express(); 
const httpServer = require('http').createServer(app); 
const mysql = require('mysql'); 
const path = require('path'); 
// const { join } = require('path/posix');

app.use(express.json());
app.use(express.urlencoded({extended: true})); 

var pool = mysql.createPool({
  connectionLimit: 15,
  host: "107.180.1.16",
  user: "fall2021group4",
  password: "fall2021group4",
  database: "cis4402021group4"
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html'); 
}); 

// Create get request for admin page and pull from database

// Create get request for mentor and mentee page and pull from database
// Next iterations of get requests will require ID's to be passed in
// Example: http:/localhost:4545/admin/dashboard.html
// app.get('/admin/dashboard', (req, res) => {

// })

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dash.html'); 
})

app.get('/admin/reports',  (req, res) => {
    res.sendFile(__dirname + '/Directory/REPORTS.html'); 
}); 

app.get('/admin/users', (req, res) => {
    res.sendFile(__dirname + '/Directory/USERPAGE.html'); 
}); 

app.get('/:relationship/chats', (req, res) => {
    let sql = `SELECT u.firstName, u.lastName, chatContent
        FROM Chats c
        JOIN Users u 
            ON u.userId = c.senderId
        WHERE relationshipId = ?`;
    pool.query(sql, [req.params.relationship], (err, results) => {
        if (err) throw err; 
        res.send({sender: `${results['u.firstName']} ${results['u.lastName']}`, chatContent: results['chatContent']}); 
    });  
}); 

app.get('/users', (req, res) => {
  res.contentType('application/json');
   
  pool.query('SELECT * FROM Users', (err, rows) => {
    if (err) throw err; 
    console.log(rows); 
    res.send(rows); 
  }); 
   
}); 

app.post('/create-account', (req, res) => {
  // inserting data into the database with create-account
  // post requests have a body that can be accessed through req.body
  // let sql = `INSERT INTO Users (email, password, firstName, lastName, department, role, userType, openToNewConnections, goals, idealRelationship, reasonForUse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  // pool.query(sql, [req.body.email, req.body.password, req.body.firstName, req.body.lastName, req.body.department, req.body.role, req.body.userType, req.body.openToNewConnections, req.body.goals, req.body.idealRelationship, req.body.reasoForUse], (err, results) => {
  //   if (err) {
  //     res.send({accountCreated: false, error: err}); 
  //   }
  //   else res.send({accountCreated: true});  
  // });

  let sql = `INSERT INTO Users (email, password, firstName, lastName, department, role, goals, idealRelationship, openToNewConnections, reasonForUse, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  pool.query(sql, [req.body.email, req.body.password, req.body.firstName, req.body.lastName, req.body.department, req.body.role, req.body.goals, req.body.idealRelationship, req.body.openToNewConnections, req.body.reasonForUse, req.body.userType], (err, results) => {
    if (err) {
      res.send({accountCreated: false, error: err}); 
    }
    else res.send({accountCreated: true});  
  });
    
  // querying the new information that has been just added and logging it
  // to the console so we can know what we are seeing
  // let querySql = `SELECT * FROM users WHERE username = ? AND password = ?` 
  // pool.query(querySql, [username, password], (err, results) => {
  //   console.log(results); 
  // });
});

app.post('/validate-login', (req, res) => {
  // we are going to be sending a json back to the page, so we have to make sure
  // to set the content type so it sends correctly
  res.contentType('application/json'); 
  
  let sql = `SELECT * FROM Users WHERE email = ? AND password = ?`;
   
  pool.query(sql, [req.body.email, req.body.password], (err, results) => {

    console.log("Email: " + req.body.email);
    console.log("Password: " + req.body.password);
    console.log("Results: " + results);
    if (String(err).length > 0 && err !== null) {
      console.log(`error: ${err}`); 
    }
    try {
      // if there are any results, the user exists in the database, so we reuse
      if (results.length === 0) {
        console.log("You're out!");
        console.log(results); 
        res.send({loginValid: false}); 
      }
      else {
        console.log("You're in the thing!");
        console.log(results); 
        res.send({loginValid: true, userId: results[0]['userId'], userName: results[0]['email']}); 
      }
    } 
    catch (e) {
      console.log(e); 
      console.log('error with /validate-login'); 
    } 
  });
   
});

// Host: 107.180.1.16
// Port: 3306
// Username: 2021group4
// PW: group4fall2021
// default schema: cis440fall2021group4

httpServer.listen(4545, () => console.log("\x1b[31m%s\x1b[0m", 'listening on port 4545')); 