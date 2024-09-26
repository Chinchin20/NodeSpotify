// app.js
const express = require('express');
const mysql = require('./database');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use(express.urlencoded({ extended: true }));

// File upload settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    mysql.query('SELECT * FROM songs', (err, results) => {
        if (err) throw err;
        res.render('index', { songs: results });
    });
});

app.get('/upload', (req, res) => {
    res.render('upload');
});

app.post('/upload', upload.fields([{ name: 'songFile' }, { name: 'coverFile' }]), (req, res) => {
    const { songName, artistName } = req.body;
    const songFile = req.files['songFile'][0].path;
    const coverFile = req.files['coverFile'][0].path;

    mysql.query('INSERT INTO songs (name, artist, file_path, cover_path) VALUES (?, ?, ?, ?)', [songName, artistName, songFile, coverFile], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
