// Declarat
const { response } = require("express");
const http = require("http");
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const mysql = require("mysql");
const path = require("path");
// const { join } = require('path/posix');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mysql.createPool is a function that takes in a configuration object and returns a pool object.
var pool = mysql.createPool({
  connectionLimit: 100,
  host: "107.180.1.16",
  user: "fall2021group4",
  password: "fall2021group4",
  database: "cis4402021group4",
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
});

// Landing page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

// Login
app.post("/validate-login", (req, res) => {
  // we are going to be sending a json back to the page, so we have to make sure
  // to set the content type so it sends correctly
  res.contentType("application/json");

  // Retrieve
  // let sql = `SELECT * FROM Users WHERE email = ? AND password = ? AND userType = ?`;
  //retrieve email, password, and usertype
  let sql = `SELECT * FROM Users WHERE email = ? AND password = ?`

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
        res.send({ loginValid: false });
      } 
      
      else {
        console.log("You're in the thing!");
        console.log(results);
        res.send({
          loginValid: true,
          userId: results[0]["userId"],
          userName: results[0]["email"],
          userType: results[0]["userType"]
        });
      }
    } catch (e) {
      console.log(e);
      console.log("error with /validate-login");
    }
  });
});

// Landing page
// dashboard use params or if statement to route to correct page
// app.get("/:userType/dashboard", (req, res) => {
//   let sql = `SELECT * FROM Users WHERE userType = ?`;
//   pool.query(sql, [req.params.userType], (err, results) => {
//     console.log(results);
//     console.log(req.params.userType);

//     if (req.params.userType === "Mentor") {
//       res.sendFile(__dirname + "/mentor_dash.html");
//     } else if (req.params.userType === "Mentee") {
//       res.sendFile(__dirname + "/mentee_dash.html");
//     } else {
//       res.sendFile(__dirname + "/admin_dash.html");
//     }

//     if (err) throw err;
//     res.send(results);
//   });
// });
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dash.html');
})

// Admin Dash -works
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(__dirname + '/admin_dash.html');
});

// Admin Report -works
app.get("/admin/reports", (req, res) => {
  res.sendFile(__dirname + "/Directory/REPORTS.html");
});

app.get("/admin/users", (req, res) => {
  res.sendFile(__dirname + "/Directory/USERPAGE.html");
});

// Mentor Dash
app.get("/mentor/dashboard", (req, res) => {
  res.sendFile(__dirname + "/mentor_dash.html");
});

// Mentee Dash
app.get("/mentee/dashboard", (req, res) => {
  res.sendFile(__dirname + "/mentee_dash.html");
});

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/chat.html");
});

app.get("/Directory/menteeSearch", (req, res) => {
  res.sendFile(__dirname + "/Directory/menteeSearch.html");
});

app.get("/Directory/reports", (req, res) => {
  res.sendFile(__dirname + "/Directory/Report/reports.html");
});

// User Page
app.get("/users/edit", (req, res) => {
  res.sendFile(__dirname + "/Directory/update.html");
});

// Retrieve userType from SQL
// app.get("/users/:userType", (req, res) => {
//   console.log("Checking userType ");
//   res.contentType("application/json");
//   pool.query(
//     `SELECT * FROM Users WHERE userType = ?`,
//     [req.params.userType],
//     (err, results) => {
//       if (err) throw err;
//       res.send(results);
//     }
//   );
// });

app.get("/users/mentors", (req, res) => {
  console.log("test test test test test test test");
  res.contentType("application/json");
  pool.query(
    'SELECT firstName, lastName, email, department, reasonForUse, u.userId, mentorId FROM Mentors me JOIN Users u ON me.userId = u.userId WHERE firstName is not null and firstName != "";',
    (err, rows) => {
      if (err) throw err;
      console.log(rows);
      res.send(rows);
    }
  );
});

// getting mentee information for the userpage
app.get("/users/mentees", (req, res) => {
  res.contentType("application/json");
  pool.query(
    'SELECT firstName, lastName, email, department, reasonForUse, u.userId, menteeId FROM Mentees m JOIN Users u ON m.userId = u.userId WHERE firstName is not null and firstName != ""',
    [],
    (err, rows) => {
      if (err) throw err;
      console.log(rows);
      res.send(rows);
    }
  );
});

app.get("/invites/count", (req, res) => {
  res.contentType("application/json");
  pool.query(
    "SELECT count(inviteId) FROM Invites WHERE inviteId IS NOT NULL",
    (err, rows) => {
      if (err) throw err;
      console.log(rows);
      res.send(rows);
    }
  );
});

app.get("/users/count", (req, res) => {
  // res.contentType('application/json');
  console.log("is this code even being ran?");
  pool.query(
    'SELECT count(userType) FROM Users WHERE userType IS NOT NULL AND userType != "";',
    [],
    (err, rows) => {
      if (err) throw err;
      console.log(rows);
      res.json(rows);
    }
  );
});

app.get("/mentor/menteeSearch", (req, res) => {
  res.sendFile(__dirname + "/Directory/menteeSearch.html");
});

app.get("/reports", (req, res) => {
  let sql = `SELECT reportId, reportDate, reportReason, comments, CONCAT(u.firstName, " ", u.lastName) as "Reporter", CONCAT(u2.firstName, " ", u2.lastName) as "Reported", reporterUserId, reportedUserId
	              FROM Reports
                JOIN Users u on u.userId = reporterUserId
                JOIN Users u2 on u2.userId = reportedUserId;`;
  pool.query(sql, [], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/users/:userId", (req, res) => {
  let sql = `SELECT userId, CONCAT(firstName, ' ', lastName) as "Full Name", email
               FROM Users
               WHERE userId = ?`;
  pool.query(sql, [req.params.userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/:userId/info", (req, res) => {
  let sql = `SELECT * FROM Users WHERE userId = ?`;
  pool.query(sql, [req.params.userId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/:relationship/chats", (req, res) => {
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

app.get("/:userId/relationships", (req, res) => {
  let sql = `SELECT r.relationshipId
      FROM Relationships r
      JOIN Mentees m on r.menteeId = m.menteeId
      JOIN Mentors mo on r.mentorId = mo.mentorId
      WHERE m.userId = ? OR mo.userId = ?`;
  pool.query(sql, [req.params.userId, req.params.userId], (err, results) => {
    if (err) throw err;
    res.json(results);
    // res.send({relationships: results[0]['relationshipId']});
  });
});

app.get("/:userId/ongoingRelationships", (req, res) => {
  let sql = `
    SELECT CONCAT(u.firstName, " ", u.lastName) as "mentorName", 
      u.email as "mentorEmail",
      u.department as "mentorDepartment", 
      u.role as "mentorRole", 
      CONCAT(u2.firstName, ' ', u2.lastName) as "menteeName", 
      u2.email as "menteeEmail",
      u2.department as "menteeDepartment", 
      u2.role as "menteeRole",
      dateBegan, lifeCycleStatus, relationshipId
    FROM Relationships r
      JOIN Mentors m on m.mentorId = r.mentorId
      JOIN Users u on u.userId = m.userId
          JOIN Mentees me on me.menteeId = r.menteeId
          JOIN Users u2 on u2.userId = me.userId
    WHERE lifeCycleStatus IN ("Ongoing", "pendingInviteAc");`;
  pool.query(sql, [], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/users", (req, res) => {
  res.contentType("application/json");

  pool.query("SELECT * FROM Users", (err, rows) => {
    if (err) throw err;
    console.log(rows);
    res.send(rows);
  });
});

app.get("/finaldash", (req, res) => {
  res.sendFile(__dirname + "/Directory/finaldash.html");
});

app.post("/update", (req, res) => {
  let sql = `
  UPDATE Users
  SET 
    firstName = ?, 
    lastName = ?, 
    email = ?,
    password = ?, 
    department = ?, 
    role = ?,
    goals = ?,
    idealRelationship = ?,
    openToNewConnections = ?,
    reasonForUse = ?
  WHERE userId = ? `;
  pool.query(
    sql,
    [
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password,
      req.body.department,
      req.body.role,
      req.body.goals,
      req.body.idealRelationship,
      req.body.openToNewConnections,
      req.body.reasonForUse,
      req.body.userId,
    ],
    (err, results) => {
      if (err) throw err;
      else {
        console.log("user updated");
      }
    }
  );
});

app.post("/save-chat", (req, res) => {
  let sql = `INSERT INTO Chats (relationshipId, senderId, chatContent) VALUES (?, ?, ?)`;
  pool.query(
    sql,
    [req.body.relationshipId, req.body.userId, req.body.message],
    (err, results) => {
      if (err) throw err;
      console.log(
        `Relationship (${req.body.relationshipId}) ${req.body.userId}: ${req.body.message}`
      );
    }
  );
});

app.post("/reports", (req, res) => {
  let sql = `INSERT INTO Reports (reporterUserId, reportedUserId, reportDate, reportReason, comments)
              VALUES (?, 
                      (SELECT userId FROM Users WHERE CONCAT(firstName, ' ', lastName) = ?),
                       ?, ?, ?);`;
  pool.query(
    sql,
    [
      req.body.reporterId,
      req.body.reportee,
      req.body.date,
      req.body.reason,
      req.body.comments,
    ],
    (err, results) => {
      if (err) {
        res.json({
          status: "rejected",
          error: "Invalid input. Please try again.",
        });
      }
      res.json({ status: "accepted" });
    }
  );
});

app.post("/create-account", (req, res) => {
  // inserting data into the database with create-account
  // post requests have a body that can be accessed through req.body
  let sql = `INSERT INTO Users(password, firstName, lastName, email, department, role, goals, idealRelationship, openToNewConnections, reasonForUse, userType) VALUES (?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?);`;

  pool.query(
    sql,
    [
      req.body.password,
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.department,
      req.body.role,
      req.body.goals,
      req.body.idealRelationship,
      req.body.openToNewConnections,
      req.body.reasonForUse,
      req.body.userType,
    ],
    (err, results) => {
      if (err) {
        res.send({ accountCreated: false, error: err });
      } else {
        console.log(`${req.body.email} was inserted`);
        insertMentorMentee(req.body.email, req.body.userType);
      }
    }
  );

  // querying the new information that has been just added and logging it
  // to the console so we can know what we are seeing
  // let querySql = `SELECT * FROM users WHERE username = ? AND password = ?`
  // pool.query(querySql, [username, password], (err, results) => {
  //   console.log(results);
  // });
});

// app.post('/validate-login', (req, res) => {
//   res.contentType('application/json');

//   let sql = `SELECT * FROM Users WHERE email = ? AND password = ?`;

//   pool.query(sql, [req.body.email, req.body.password], (err, results) => {
//     if (String(err).length > 0 && err !== null) {
//       console.log(`error: ${err}`);
//     }
//     try {
//       // if there are any results, the user exists in the database, so we reuse
//       if (results.length === 0) {
//         console.log("You're out!");
//         console.log(results);
//         res.send({loginValid: false});
//       }
//       else {
//         console.log("You're in the thing!");
//         console.log(results);
//         res.send({loginValid: true, userId: results[0]['userId'], userName: results[0]['email']});
//       }
//     }
//     catch (e) {
//       console.log(e);
//       console.log('error with /validate-login');
//     }
//   });

// });

// lol hopefully these are some good post requests :v)
app.post("/send-invite", (req, res) => {
  let sql = `INSERT INTO Invites(inviteId, inviteContent, inviteLifecycleStatus, mentorId, menteeId) VALUES (?, ?, ?, ?, ?)`;
  pool.query(
    sql,
    [
      req.body.inviteId,
      req.body.inviteContent,
      req.body.inviteLifecycleStatus,
      req.body.mentorId,
      req.body.menteeId,
    ],
    (err, results) => {
      if (err) throw err;
      console.log(
        `Invite with ID ${req.body.inviteId} between mentor ${req.body.mentorId} and mentee ${req.body.menteeId} created.`
      );
    }
  );
});

app.post("/send-relationship", (req, res) => {
  let sql = `INSERT INTO Relationships(relationshipId, inviteId, menteeId, mentorId, dateBegan, lifeCycleStatus) VALUES (?, ?, ?, ?, ?, ?)`;
  pool.query(
    sql,
    [
      req.body.relationshipId,
      req.body.inviteId,
      req.body.menteeId,
      req.body.mentorId,
      req.body.dateBegan,
      req.body.lifeCycleStatus,
    ],
    (err, results) => {
      if (err) throw err;
      console.log(
        `Relationship with ID ${req.body.relationshipId} between mentor ${req.body.mentorId} and mentee ${req.body.menteeId} created.`
      );
    }
  );
});

const insertMentorMentee = (email, userType) => {
  var table;
  switch (userType) {
    case "Mentor":
      table = "Mentors";
      break;
    case "Mentee":
      table = "Mentees";
      break;
  }
  let sql = `INSERT INTO ${table}(userId) SELECT userId FROM Users WHERE email = ? ORDER BY userId LIMIT 1`;
  pool.query(sql, [email], (err, results) => {
    if (err) {
      console.log(err);
    }
  });
};
// Host: 107.180.1.16
// Port: 3306
// Username: 2021group4
// PW: group4fall2021
// default schema: cis440fall2021group4

httpServer.listen(4545, () =>
  console.log("\x1b[31m%s\x1b[0m", "listening on port 4545")
);