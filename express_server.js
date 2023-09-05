const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Home
app.get('/', (req, res) => { // * Will need to change this *
  res.send('Hello!');
});

// New
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Post New URL
app.post("/urls/", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  console.log(req.body);
  console.log(urlDatabase);
  res.redirect(`/urls/`);
});

// All URLs
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Specific URL
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Garbage?
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Edit URL => Redirect to all URLs
app.post(`/urls/:id`, (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});


// Delete a URL => Redirect to All URLs
app.post(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Redirects to actual long URL of the short URL ID
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Post Route for Login

app.post("/login", (req, res) => {
  const { username } = req.body;

  console.log(username);

  res.cookie('username', username);

  res.redirect('/urls');
});




// Listen
app.listen(PORT, (req, res) => {
  console.log(`App is listening on ${PORT}!`);
});
