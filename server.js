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
//middleware
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    secret: require('crypto').randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: true,

}));

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.post('/register', async(req, res)=>{
    const {firstName, lastName, email, password} = req.body;
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
    if(userCheck.rows.length > 0){
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUE ($1, $2, $3, $4)',
        [firstName, lastName, email, hashedPassword]
    );

    res.send('Registration successful');

})

app.listen(port, ()=>{
    console.log(`listning http://localhost:${port}`);
})