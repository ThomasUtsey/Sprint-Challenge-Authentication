const axios = require('axios');
const db = require('../config/model')
const crypt = require('bcryptjs')
const jwtKey = require('../auth/authenticate')
const { authenticate } = require('../auth/authenticate');
const jwt = require("jsonwebtoken")


module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
    let user = req.body;
    const hash = crypt.hashSync( user.password,10);
    user.password=hash;
    console.log(user)
    db.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
        .catch(error => {res.status(500).json(error)});
}



function login(req, res) {
  let { username, password } = req.body;
  // console.log (username)
  
  
  db.findBy({ username})
  
    .first()
    .then(user => {  
      
      if (user && crypt.compareSync(password,user.password)) {
        console.log(user)
       const token = generateToken(user)
        // console.log(token)
        res.status(200).json({ message: `Welcome ${user}!}), have a token`,token,});
      } else {
        
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
function generateToken(user){
  const payload = {
    subject: user.id,
    user:user.username,
  }
  const options = {
    expiresIn:'1d'
  }
  return jwt.sign(payload,'secret MESSAGE',options);
}
