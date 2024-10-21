const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // Session store for MySQL

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Your client URL
  credentials: true // Allow credentials to be sent with requests
}));
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pymatch_db"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Configure express-session middleware with MySQL store
const sessionStore = new MySQLStore({}, db);
app.use(session({
  secret: 'your_secret_key', // Replace with your secret key
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Store sessions in MySQL
  cookie: {
    secure: false, // Set to true if using https
    httpOnly: true, // Helps to prevent XSS attacks by restricting access to the cookie from client-side scripts
    maxAge: 1000 * 60 * 60 * 24 // Session expiry time (e.g., 1 day)
  }
}));

// Check if email is already registered
app.get('/check-email', (req, res) => {
  const { email } = req.query;
  const sql = "SELECT * FROM user WHERE `email` = ?";
  
  db.query(sql, [email], (err, data) => {
    if (err) {
      console.error("Error checking email uniqueness:", err);
      return res.status(500).json({ error: "Error checking email uniqueness" });
    }

    if (data.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

// Sign-up route to register new users
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const sqlCheck = "SELECT * FROM user WHERE `email` = ?";

  // First check if the email is already registered
  db.query(sqlCheck, [email], (err, data) => {
    if (err) {
      console.error("Error during email check:", err);
      return res.status(500).json({ error: "Error during email check" });
    }

    if (data.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    } else {
      // Insert new user
      const sqlInsert = "INSERT INTO user (`name`, `email`, `password`) VALUES (?, ?, ?)";
      db.query(sqlInsert, [name, email, password], (err, result) => {
        if (err) {
          console.error("Error during user registration:", err);
          return res.status(500).json({ error: "Error during user registration" });
        }

        return res.status(201).json({ message: "User registered successfully" });
      });
    }
  });
});

// Login route with session handling
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM user WHERE `email` = ? AND `password` = ?";

  db.query(sql, [email, password], (err, data) => {
    if (err) {
      console.error("Error during login query:", err);
      return res.status(500).json({ error: "Error during login" });
    }
    
    if (data.length > 0) {
      const user = data[0]; // Get the user data from the query result

      // Create a session for the user
      req.session.user = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        password: user.password
      };

      return res.json({
        success: true,
        user: req.session.user
      });
    } else {
      return res.json({ success: false, message: "Invalid email or password." });
    }
  });
});

// Logout route to destroy session
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: 'Error during logout' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    return res.json({ message: 'Logged out successfully' });
  });
});

// Protected route to check session
app.get('/home', (req, res) => {
  if (req.session.user) {
    return res.json({ success: true, user: req.session.user });
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// Check authentication route
app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Route to fetch questions by category
app.get('/questions', (req, res) => {
  const { category } = req.query; // Get the category from query params

  const sql = "SELECT * FROM question WHERE `category` = ?";
  db.query(sql, [category], (err, data) => {
    if (err) {
      console.error("Error fetching questions:", err);
      return res.status(500).json({ error: "Error fetching questions" });
    }
    
    return res.json(data); // Return the questions as JSON
  });
});

app.post('/saveGameHistory', (req, res) => {
  const { userId, score, timeTaken, completed } = req.body;

  console.log('Incoming data for game history:', { userId, score, timeTaken, completed }); // Log incoming data

  const sql = "INSERT INTO game_history (user_id, score, time_taken, completed) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, score, timeTaken, completed], (err, result) => {
    if (err) {
      console.error("Error saving game history:", err); // Improved error logging
      return res.status(500).json({ error: "Error saving game history" });
    }

    return res.status(201).json({ message: "Game history saved successfully" });
  });
});

const getGameHistoryFromDatabase = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM game_history WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        return reject(err); // Reject if there’s an error
      }
      resolve(results); // Resolve with results
    });
  });
};

app.get('/getGameHistory', async (req, res) => {
  const userId = req.query.userId;
  try {
    const gameHistory = await getGameHistoryFromDatabase(userId); // Your logic to get game history
    res.json(gameHistory);
  } catch (error) {
    console.error('Error retrieving game history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch leaderboard data
app.get('/leaderboard', async (req, res) => {
  try {
      // Query to get the high scores from the game_history table,
      // joining with the user table to get the names
      const sql = `
          SELECT gh.user_id, u.name, MIN(gh.time_taken) AS time_taken
          FROM game_history gh
          JOIN user u ON gh.user_id = u.user_id
          GROUP BY gh.user_id, u.name
          ORDER BY time_taken ASC
      `;

      db.query(sql, (err, rows) => {
          if (err) {
              console.error('Error fetching leaderboard data:', err);
              return res.status(500).json({ error: 'Internal server error' });
          }

          // Prepare leaderboard data
          const leaderboard = rows.map(row => ({
              name: row.name,
              time_taken: row.time_taken
          }));

          res.json(leaderboard); // Send back the leaderboard data
      });
  } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(8081, () => {
  console.log("Server running on http://localhost:8081");
});
