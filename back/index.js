import pool from './db.js'
import express from 'express'
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express()
const port = 3000

app.use(express.json())
app.use(cors());

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

app.get('/profile', async (req, res) => { //renvoie info user sinon 404
  let token = req.headers.authorization
  if (!token || token != ""){
    try {
      let payload = jwt.verify(token.substr(7), 'bloupblipbloup')

      let dblogin = await pool.query(`select id, mail, password from T_user where id = $1 and mail = $2 limit 1`, [payload.uuid, payload.email])
      if (dblogin.rowCount <=0) {res.status(404).json({message:"not found"});}
      res.status(200).json({
        id: dblogin.rows[0].id,
        mail: dblogin.rows[0].mail,
        password: dblogin.rows[0].password
      });
    
    }catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
  else{
    res.status(401).json({message:"unauthorized"});
  }
})

app.post('/articles', async (req, res) => { //renvoie 400 sinon 401 si pas de token et 201 si creer
  let uuidArticle = uuidv4();
  let title = req.body.title
  let content = req.body.content
  let publicationdate = req.body.publicationdate
  let token = req.headers.authorization
  if (!token || token != ""){
    try {
      let payload = jwt.verify(token.substr(7), 'bloupblipbloup')

      if (title != "" && content != "" && publicationdate != "") {
        let dblogin = await pool.query(`INSERT INTO T_Articles (id, author, title, content, publicationdate) VALUES ($1, $2, $3, $4, $5)`, [uuidArticle, payload.uuid, title, content, publicationdate])
        if (dblogin.rowCount <=0) {res.status(400).json({message:"insertion error"});}
        res.status(201).json({message:"article created"});
      }
      else{
        res.status(400).json({message:"bad request"});
      }
    }catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
  else{
    res.status(401).json({message:"unauthorized"});
  }
})

app.get('/articles', async (req, res) => { //renvoie tous les articles code 200
  let articles = await pool.query(`select T_Articles.id, T_user.mail, title, content, publicationdate from T_Articles join T_user on T_Articles.author = T_user.id`)
  if (articles.rowCount <=0) {res.status(404).json({message:"not found"});}
  res.status(200).json(
    articles.rows.map(article => ({
      id: article.id,
      author: article.author,
      title: article.title,
      content: article.content,
      publicationdate: article.publicationdate
    }))
  );
})

app.get('/articles/:id', async (req, res) => { //renvoie un article code 200
  let article = await pool.query(`select T_Articles.id, T_user.mail, title, content, publicationdate from T_Articles join T_user on T_Articles.author = T_user.id where T_Articles.id = $1`, [req.params.id])
  if (article.rowCount <=0) {res.status(404).json({message:"not found"});}
  res.status(200).json({
    id: article.rows[0].id,
    author: article.rows[0].author,
    title: article.rows[0].title,
    content: article.rows[0].content,
    publicationdate: article.rows[0].publicationdate
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})