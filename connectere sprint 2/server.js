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

app.get('/admin/reports',  (req, res) => {
    res.sendFile(__dirname + '/Directory/REPORTS.html'); 
}); 

app.get('/admin/users', (req, res) => {
    res.sendFile(__dirname + '/Directory/USERPAGE.html'); 
}); 

app.get('/mentor/menteeSearch', (req, res) => {
  res.sendFile(__dirname + '/Directory/menteeSearch.html'); 
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

// getting the count of users with a valid first name
app.get('/users/count', (req, res) => {
  res.contentType('application/json');
  pool.query('SELECT count(firstName) FROM Users WHERE firstName IS NOT NULL AND firstName != ""', (err, rows) => {
    if (err) throw err; 
    console.log(rows); 
    res.send(rows); 
  }); 
}); 

// getting mentor information for the userpage
app.get('/users/mentors', (req, res) => {
  res.contentType('application/json');
  pool.query('SELECT firstName, lastName, email, department, reasonForUse, u.userId, mentorId FROM Mentors me JOIN Users u ON me.userId = u.userId WHERE firstName is not null and firstName != "";', (err, rows) => {
    if (err) throw err; 
    console.log(rows); 
    res.send(rows); 
  }); 
}); 

// getting mentee information for the userpage
app.get('/users/mentees', (req, res) => {
  res.contentType('application/json');
  pool.query('SELECT firstName, lastName, email, department, reasonForUse, u.userId, menteeId FROM Mentees m JOIN Users u ON m.userId = u.userId WHERE firstName is not null and firstName != "";', (err, rows) => {
    if (err) throw err; 
    console.log(rows); 
    res.send(rows); 
  }); 
}); 

app.post('/create-account', (req, res) => {
  // inserting data into the database with create-account
  // post requests have a body that can be accessed through req.body
  let sql = `INSERT INTO Users(password, firstName, lastName, email, department, role, goals, idealRelationship, openToNewConnections, reasonForUse) VALUES (?, ?, ?, ?, ?, ?,  ?, ?, ?, ?);`
   
  pool.query(sql, [req.body.password, req.body.firstName, req.body.lastName, req.body.email, req.body.department, req.body.role, req.body.goals, req.body.idealRelationship, 
      req.body.openToNewConnections, req.body.reasonForUse], (err, results) => {
      if (err) {
        res.send({accountCreated: false, error: err}); 
      }
      else {
        console.log(`${req.body} was inserted`)
      }
    }); 
  
    switch (req.body.mentorStatus) {
    case "Mentor": 
      pool.query(`INSERT INTO Mentors VALUES (mentorId) SELECT userId FROM Users ORDER BY userId LIMIT 1`);
      break; 
    case "Mentee": 
      pool.query(`INSERT INTO Mentees VALUES (menteeId) SELECT userId FROM Users ORDER BY userId LIMIT 1`); 
      break; 
  } 
    
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
  
  let sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
   
  pool.query(sql, [req.body.username, req.body.password], (err, results) => {
    if (String(err).length > 0 && err !== null) {
      console.log(`error: ${err}`); 
    }
    try {
      // if there are any results, the user exists in the database, so we reuse
      if (results.length === 0) {
        console.log(results); 
        res.send({loginValid: false}); 
      }
      else {
        console.log(results); 
        res.send({loginValid: true, userId: results[0]['userId'], userName: results[0]['username']}); 
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