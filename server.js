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

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + "/chat.html"); 
}); 

app.get('/dash.html', (req, res) => {
    res.sendFile(__dirname + '/dash.html'); 
}); 

app.get('/Directory/menteeSearch', (req, res) => {
    res.sendFile(__dirname + '/Directory/menteeSearch.html'); 
});

app.get('/Directory/reports', (req, res) => {
    res.sendFile(__dirname + '/Directory/Report/reports.html'); 
}); 

app.post('/reports', (req, res) => {
    let sql = `INSERT INTO Reports (reporterUserId, reportedUserId, reportDate, reportReason, comments)
                VALUES (?, 
                        (SELECT userId FROM Users WHERE CONCAT(firstName, ' ', lastName) = ?),
                         ?, ?, ?);`
    pool.query(sql, [req.body.reporterId, req.body.reportee, req.body.date, req.body.reason, req.body.comments], (err, results) => {
      if (err) {
        res.json({"status": "rejected", "error": "Invalid input. Please try again."});
      }
      res.json({"status": "accepted"}); 
    });
}); 

app.get('/reports', (req, res) => {
  let sql = `SELECT reportId, reportDate, reportReason, comments, CONCAT(u.firstName, " ", u.lastName) as "Reporter", CONCAT(u2.firstName, " ", u2.lastName) as "Reported", reporterUserId, reportedUserId
	              FROM Reports
                JOIN Users u on u.userId = reporterUserId
                JOIN Users u2 on u2.userId = reportedUserId;`
  pool.query(sql, [], (err, results) => {
    if (err) throw err; 
    res.json(results); 
  })
}); 

app.get('/login.html', (req, res) => {
    res.sendfile(__dirname + '/login.html'); 
}); 

app.get('/users/:userId', (req, res) => {
    let sql = `SELECT userId, CONCAT(firstName, ' ', lastName) as "Full Name", email
               FROM Users
               WHERE userId = ?`; 
    pool.query(sql, [req.params.userId], (err, results) => {
      if (err) throw err; 
      res.json(results); 
    })
}); 

app.post('/validate-login', (req, res) => {
  // we are going to be sending a json back to the page, so we have to make sure
  // to set the content type so it sends correctly
  res.contentType('application/json'); 
  
  let sql = `SELECT * FROM Users WHERE email = ? AND password = ?`;
   
  pool.query(sql, [req.body.email, req.body.password], (err, results) => {
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

app.get('/admin/reports',  (req, res) => {
    res.sendFile(__dirname + '/Directory/REPORTS.html'); 
}); 

app.get('/admin/users', (req, res) => {
    res.sendFile(__dirname + '/Directory/USERPAGE.html'); 
}); 

app.get('/:relationship/chats', (req, res) => {
    let sql = `SELECT CONCAT(u.firstName, ' ',  u.lastName) AS "Sender", chatContent, relationshipId, c.timeSent
        FROM Chats c
        JOIN Users u 
            ON u.userId = c.senderId
        WHERE relationshipId = ?`;
    pool.query(sql, [req.params.relationship], (err, results) => {
        if (err) throw err; 
        res.json(results); 
        // res.send({sender: `${results['Sender']}`, chatContent: results['chatContent'], relationsihp: results['relationshipId'], timeSent: results['timeSent']}); 
    });  
}); 

app.post('/save-chat', (req, res) => {
  let sql = `INSERT INTO Chats (relationshipId, senderId, chatContent) VALUES (?, ?, ?)`; 
  pool.query(sql, [req.body.relationshipId, req.body.userId, req.body.message], (err, results) => {
    if (err) throw err; 
    console.log(`Relationship (${req.body.relationshipId}) ${req.body.userId}: ${req.body.message}`); 
  });
})


app.get('/:userId/relationships', (req, res) => {
    let sql = `SELECT r.relationshipId
      FROM Relationships r
      JOIN Mentees m on r.menteeId = m.menteeId
      JOIN Mentors mo on r.mentorId = mo.mentorId
      WHERE m.userId = ? OR mo.userId = ?`; 
    pool.query(sql, [req.params.userId, req.params.userId], (err, results) => {
      if (err) throw err;
      res.json(results); 
      // res.send({relationships: results[0]['relationshipId']}); 
    })
}); 


app.get('/users', (req, res) => {
  res.contentType('application/json');
   
  pool.query('SELECT * FROM users', (err, rows) => {
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

// getting the count of invites
app.get('/invites/count', (req, res) => {
  res.contentType('application/json');
  pool.query('SELECT count(inviteId) FROM Invites WHERE inviteId IS NOT NULL', (err, rows) => {
    if (err) throw err; 
    console.log(rows); 
    res.send(rows); 
  }); 
}); 


// lol hopefully these are some good post requests :v)
app.post('/send-invite', (req, res) => {
  let sql = `INSERT INTO Invites(inviteId, inviteContent, inviteLifecycleStatus, mentorId, menteeId) VALUES (?, ?, ?, ?, ?)`
  pool.query(sql, [req.body.inviteId, req.body.inviteContent, req.body.inviteLifecycleStatus, req.body.mentorId, req.body.menteeId], (err, results) => {
    if (err) throw err;
    console.log(`Invite with ID ${req.body.inviteId} between mentor ${req.body.mentorId} and mentee ${req.body.menteeId} created.`);
  })
});

app.post('/send-relationship', (req, res) => {
  let sql = `INSERT INTO Relationships(relationshipId, inviteId, menteeId, mentorId, dateBegan, lifeCycleStatus) VALUES (?, ?, ?, ?, ?, ?)`
  pool.query(sql, [req.body.relationshipId, req.body.inviteId, req.body.menteeId, req.body.mentorId, req.body.dateBegan, req.body.lifeCycleStatus], (err, results) => {
    if (err) throw err;
    console.log(`Relationship with ID ${req.body.relationshipId} between mentor ${req.body.mentorId} and mentee ${req.body.menteeId} created.`)
  })
});

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

app.get('/users/count', (req, res) => {
  res.contentType('application/json');
  pool.query('SELECT count(firstName) FROM Users WHERE firstName IS NOT NULL AND firstName != ""', (err, rows) => {
    if (err) throw err; 
    console.log(rows); 
    res.send(rows); 
  }); 
}); 

app.get('/mentor/menteeSearch', (req, res) => {
  res.sendFile(__dirname + '/Directory/menteeSearch.html'); 
}); 
// Host: 107.180.1.16
// Port: 3306
// Username: 2021group4
// PW: group4fall2021
// default schema: cis440fall2021group4

httpServer.listen(4545, () => console.log("\x1b[31m%s\x1b[0m", 'listening on port 4545')); 