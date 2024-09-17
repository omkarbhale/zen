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

app.listen(port, ()=>{
    console.log(`listning http://localhost:${port}`);
})