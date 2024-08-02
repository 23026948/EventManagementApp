const express = require('express');
const mysql = require('mysql2');
const app = express();
const multer = require('multer');
const path = require('path');

const connection = mysql.createConnection({
  host: 'db4free.net',
  user: 'haoyi123',
  password: 'Republic_C207',
  database: 'c237_submission'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  connection.query('SELECT * FROM events', (error, results) => {
    if (error) throw error;
    res.render('index', { eventmanagementapp: results });
  });
});

app.get('/event/:id', (req, res) => {
  const Event_ID = req.params.id;
  const sql = 'SELECT * FROM events WHERE Event_ID = ?';
  connection.query(sql, [Event_ID], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving event by ID');
    }
    if (results.length > 0) {
      res.render('event', { event: results[0] });
    } else {
      res.render('event', { event: null });
    }
  });
});

app.get('/event', (req, res) => {
  res.render('addEvent');
});

app.post('/event', upload.single('Image'), (req, res) => {
  const { Title, Description, Start_Date, End_Date, Location } = req.body;
  let Image;
  if (req.file) {
    Image = req.file.filename;
  } else {
    Image = null;
  }
  const sql = 'INSERT INTO events (Title, Description, Start_Date, End_Date, Location, Image) VALUES (?,?,?,?,?,?)';
  connection.query(sql, [Title, Description, Start_Date, End_Date, Location, Image], (error, results) => {
    if (error) {
      console.error("Error adding event:", error);
      res.status(500).send('Error adding event');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/editEvent/:id', (req, res) => {
  const Event_ID = req.params.id;
  const sql = 'SELECT * FROM events WHERE Event_ID =?';
  connection.query(sql, [Event_ID], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving event by ID');
    }
    if (results.length > 0) {
      res.render('editEvent', { event: results[0] });
    } else {
      res.status(404).send('Event not found');
    }
  });
});

app.post('/editEvent/:id', upload.single('Image'), (req, res) => { 
  const Event_ID = req.params.id; 
  const { Title, Description, Start_Date, End_Date, Location } = req.body; 
  let Image = req.body.currentImage; 
  if (req.file) { 
    Image = req.file.filename; 
  } 
  const sql = 'UPDATE events SET Title = ?, Description = ?, Start_Date = ?, End_Date = ?, Location = ?, Image = ? WHERE Event_ID = ?'; 
  connection.query(sql, [Title, Description, Start_Date, End_Date, Location, Image, Event_ID], (error, results) => { 
    if (error) { 
      console.error("Error updating event:", error); 
      res.status(500).send('Error updating event'); 
    } else { 
      res.redirect('/'); 
    } 
  }); 
});

app.get('/deleteEvent/:id', (req, res) => {
  const Event_ID = req.params.id;
  const sql = 'DELETE FROM events WHERE Event_ID =?';
  connection.query(sql, [Event_ID], (error, results) => {
    if (error) {
      console.error('Error deleting event:', error.message);
      return res.status(500).send('Error deleting event');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/user/:id', (req, res) => {
  const User_ID = req.params.id;
  const sql = 'SELECT * FROM users WHERE User_ID = ?';
  connection.query(sql, [User_ID], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving user by ID');
    }
    if (results.length > 0) {
      res.render('user', { user: results[0] });
    } else {
      res.status(404).send('Attendee not found');
    }
  });
});

app.get('/user', (req, res) => {
  res.render('addUser');
});

app.post('/user', upload.single('Profile_Picture'), (req, res) => {
  const { Username, Email, DOB, Contact } = req.body;
  let Profile_Picture;
  if (req.file) {
    Profile_Picture = req.file.filename;
  } else {
    Profile_Picture = null;
  }
  const sql = 'INSERT INTO users (Username, Email, DOB, Contact, Profile_Picture) VALUES (?,?,?,?,?)';
  connection.query(sql, [Username, Email, DOB, Contact, Profile_Picture], (error, results) => {
    if (error) {
      console.error("Error adding attendee:", error);
      res.status(500).send('Error adding attendee');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/editUser/:id', (req, res) => {
  const User_ID = req.params.id;
  const sql = 'SELECT * FROM users WHERE User_ID =?';
  connection.query(sql, [User_ID], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving attendee by ID');
    }
    if (results.length > 0) {
      res.render('editUser', { user: results[0] });
    } else {
      res.status(404).send('Attendee not found');
    }
  });
});

app.post('/editUser/:id', upload.single('Profile_Picture'), (req, res) => {
  const User_ID = req.params.id;
  const { Username, Email, DOB, Contact } = req.body;
  let Profile_Picture = req.body.currentImage;
  if (req.file) {
    Profile_Picture = req.file.filename;
  }
  const sql = 'UPDATE users SET Username = ?, Email = ?, DOB = ?, Contact = ?, Profile_Picture = ? WHERE User_ID = ?';
  connection.query(sql, [Username, Email, DOB, Contact, Profile_Picture, User_ID], (error, results) => {
    if (error) {
      console.error("Error updating attendee:", error);
      res.status(500).send('Error updating attendee');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/deleteUser/:id', (req, res) => {
  const User_ID = req.params.id;
  const sql = 'DELETE FROM users WHERE User_ID =?';
  connection.query(sql, [User_ID], (error, results) => {
    if (error) {
      console.error('Error deleting attendee:', error.message);
      return res.status(500).send('Error deleting attendee');
    } else {
      res.redirect('/');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
