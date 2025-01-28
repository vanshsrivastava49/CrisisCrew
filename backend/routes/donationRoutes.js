const express = require('express');
const router = express.Router();
const db = require('../config/db');
router.post('/donate', (req, res) => {
    const { fullname, email, amount } = req.body;
    if (!fullname || !email || !amount) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const query = 'INSERT INTO donation (fullname, email, amount) VALUES (?, ?, ?)';
    db.query(query, [fullname, email, amount], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Database error', error: error.message });
        }
        res.status(201).json({ message: 'Donation recorded successfully', donationId: result.insertId });
    });
});
module.exports = router;
