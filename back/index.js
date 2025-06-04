import pool from './db.js'
import express from 'express'
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('KAKOU KAKOU !')
})

app.post('/register', async (req, res) => { //creer dans la bdd -> 201 sinon 400 quand champ pas valid
  let id = uuidv4();
  let mail = req.body.email
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (mail == '' || !mail.match(emailFormat)) { res.status(400).json({message:"bad request"}); }
  let password = req.body.password
  if (password == '') { res.status(400).json({message:"bad request"}); }

  try {
    await pool.query(`INSERT INTO T_user (id, mail, password) VALUES ($1, $2, $3)`, [id, mail, password])
  }
  catch (error) {
    if (error.message.includes("duplicate"))
    res.status(409).json({message:"User already exists"});
  }
  res.status(201).json({message:"User created"});
})

app.post('/login', async (req, res) => { //existe dans la bdd et bon mot de passe -> 200 sinon 400 bad request 404 not found
  let mail = req.body.email
  let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (mail == '' || !mail.match(emailFormat)) { res.status(400).json({message:"bad request"}); }
  let password = req.body.password
  if (password == '') { res.status(400).json({message:"bad request"}); }
  
  let dblogin = await pool.query(`select id, mail from T_user where mail = $1 and password = $2 limit 1`, [mail, password])
  if (dblogin.rowCount <=0) {res.status(404).json({message:"user not found"});}
  let token = jwt.sign({ uuid: dblogin.rows[0].id, email: dblogin.rows[0].mail }, 'bloupblipbloup');
  res.status(200).json({
    message:"sucess",
    access_token: token
  });
})

app.get('/profile', (req, res) => { //renvoie info user sinon 404
  let token = req.headers.authorization
  let payload = jwt.verify(token.substr(7), 'bloupblipbloup')
  console.log(payload)
  let dblogin = await pool.query(`select id, mail, password from T_user where id = $1 and mail = $2 limit 1`, [payload.uuid, payload.email])
  if (dblogin.rowCount <=0) {res.status(401).json({message:"unauthorized"});}
  res.status(200).json({
    id: dblogin.rows[0].id,
    mail: dblogin.rows[0].mail,
    password: dblogin.rows[0].password
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})