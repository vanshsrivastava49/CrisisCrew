const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};
router.post('/signup', async (req, res) => {
    const { username, email, password, latitude, longitude } = req.body;

    if (!username || !email || !password || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sqlCheckEmail = 'SELECT * FROM users WHERE email = ?';
        db.query(sqlCheckEmail, [email], (err, results) => {
            if (err) {
                console.error('Database error during email check:', err);
                return res.status(500).json({ message: 'Database error during email check', error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already in use.' });
            }

            const sqlInsert = 'INSERT INTO users (username, email, password, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
            db.query(sqlInsert, [username, email, hashedPassword, latitude, longitude], (err) => {
                if (err) {
                    console.error('Database error during user registration:', err);
                    return res.status(500).json({ message: 'Error registering user', error: err.message });
                }
                res.status(201).json({ message: 'User registered successfully!' });
            });
        });
    } catch (error) {
        console.error('Hashing error:', error);
        res.status(500).json({ message: 'Error hashing password', error });
    }
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        console.log('User logged in, session ID:', req.session.userId);
        res.json({ message: 'Logged in successfully', token: generateToken(user.id) });
    });
});
router.get('/profile', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        console.log('Unauthorized access attempt');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Profile request by user ID:', userId);

    const sql = 'SELECT username, email, latitude, longitude FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(results[0]);
    });
});
router.post('/update-location', (req, res) => {
    const { userId, latitude, longitude } = req.body;
    if (!userId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'User ID, latitude, and longitude are required' });
    }
    const sql = 'UPDATE users SET latitude = ?, longitude = ? WHERE id = ?';
    db.query(sql, [latitude, longitude, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating location' });
        }
        res.json({ message: 'Location updated successfully' });
    });
}); 
router.get('/admin/users', (req, res) => {
    const userId = req.session.userId;
    const sql = 'SELECT * FROM users WHERE id = ?';
    
    db.query(sql, [userId], (err, results) => {
        if (err || results.length === 0 || !results[0].isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const sqlAllUsers = 'SELECT id, username, email, isAdmin FROM users';
        db.query(sqlAllUsers, (err, users) => {
            if (err) return res.status(500).json({ message: 'Error fetching users', error: err });
            res.status(200).json(users);
        });
    });
});
router.get('/check-admin/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT isAdmin FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ isAdmin: results[0].isAdmin });
    });
});
router.get('/users', (req, res) => {
    const sql = 'SELECT username, email FROM users';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching users' });
        res.status(200).json(results);
    });
});
module.exports = router;
