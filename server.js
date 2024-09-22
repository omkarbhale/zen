const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { Pool } = require('pg');
const app = express();
const port = 3000;

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'penzu_users',
    password: 'admin',
    port: 5432,
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: require('crypto').randomBytes(64).toString('hex'), // For dev, static secret for production
    resave: false,
    saveUninitialized: true,
}));

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Register Route
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)',
        [firstName, lastName, email, hashedPassword]
    );

    res.send('Registration successful');

}); 

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length === 0) {
            return res.status(400).send('No account with this email');
        }

        const user = userCheck.rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).send('Incorrect password');
        }

        req.session.user = {
            id: user.id,
            email: user.email,
        };

        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error');
    }
});

// Home page (for logged-in users)
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.send(`Welcome to the home page, ${req.session.user.email}!`);
});

// Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
