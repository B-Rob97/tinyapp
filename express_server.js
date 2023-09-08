// Import required dependencies and modules
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString(5)]
}));

// URL & User Database
const urlDatabase = {};
const userDatabase = {};

// Home
app.get('/', (req, res) => {
  return res.redirect('/login');
});

// New URL Get Route
app.get("/urls/new", (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];

  if (!loggedInUser) {
    res.redirect("/login");
  }

  const templateVars = {
    user: loggedInUser
  };
  res.render("urls_new", templateVars);
});

// New URL Post Route
app.post("/urls", (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];
  if (!loggedInUser) {
    return res.send("You cannot shorten URLs wihtout logging in.");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: loggedInUser.id };
  res.redirect(`/urls`);
});

// Specific URL Get Route
app.get('/urls/:id', (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];
  const shortURL = req.params.id;

  if (!loggedInUser) {
    return res.send("Please log in to edit a URL");
  }

  const url = urlDatabase[shortURL];

  if (!url) {
    return res.status(404).send("Error: URL does not exist");
  }

  const templateVars = {
    user: loggedInUser,
    id: shortURL,
    longURL: url.longURL,
  };

  res.render("urls_show", templateVars);
});

// Edit URL Post Route
app.post(`/urls/:id`, (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];
  const shortURL = req.params.id;
  const longURL = req.body.longURL;

  if (!loggedInUser) {
    return res.send("Please log in to edit a URL");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Error: URL does not exist");
  }

  if (urlDatabase[shortURL].userID !== loggedInUser.id) {
    return res.status(403).send("Error: You do not have permission to edit this URL");
  }

  urlDatabase[shortURL] = { longURL, userID: loggedInUser.id };
  res.redirect(`/urls`);
});

// Delete a URL Post Route
app.post('/urls/:shortURL/delete', (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];
  
  if (!loggedInUser) {
    return res.send("Please log in to delete a URL");
  }

  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];

  if (!url) {
    return res.status(404).send("Error: URL does not exist");
  }

  if (url.userID !== loggedInUser.id) {
    return res.status(403).send("Error: You do not have permission to delete this URL");
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Delete URL Get Route
app.get('/urls/:shortURL/delete', (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];
  
  if (!loggedInUser) {
    return res.send("Please log in to delete a URL");
  }

  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];

  if (!url) {
    return res.status(404).send("Error: URL does not exist");
  }

  if (url.userID !== loggedInUser.id) {
    return res.status(403).send("Error: You do not have permission to delete this URL");
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Redirects to Long URL of the short URL ID Get Route
app.get("/u/:id", (req, res) => {
  
  if (!urlDatabase[req.params.id]) {
    return res.send("URL does not exist.");
  }

  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

// All URLs Get Route
app.get('/urls', (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];
  
  if (!loggedInUser) {
    return res.send("Please log in or register to view short URLs");
  }

  const userURLs = urlsForUser(loggedInUser.id, urlDatabase);
  
  const templateVars = {
    user: loggedInUser,
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});


// Login Get Route

app.get("/login", (req, res) => {
  
  const loggedInUser = userDatabase[req.session.user_id];
  
  if (loggedInUser) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: loggedInUser
  };

  res.render("login", templateVars);
});


// Login Post Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const userID = getUserByEmail(email, userDatabase);

  if (!userID) {
    res.status(403);
    return res.send("User account does not exist.");
  }

  const hashedPassword = userDatabase[userID].hashedPassword;

  if (!bcrypt.compareSync(password, hashedPassword)) {
    res.status(403);
    return res.send("Incorrect Password");
  }

  req.session.user_id = userID;
  return res.redirect("/urls");
});


// Logout Post Route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Registration Form Get Route
app.get("/register", (req, res) => {
  const loggedInUser = userDatabase[req.session.user_id];
  
  if (loggedInUser) {
    return res.redirect("/urls");
  }
  
  const templateVars = {
    user: loggedInUser};

  res.render("registration", templateVars);

});

// Registration Post Route
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();

  if (email.length === 0 || password.length === 0) {
    res.status(400);
    return res.send("Please enter a valid email and/or password");
  }

  if (getUserByEmail(email, userDatabase)) {
    res.status(400);
    return res.send("Email already registered.");
  }

  const newUser = {
    id,
    email,
    hashedPassword
  };

  userDatabase[id] = newUser;

  req.session.user_id = id;

  console.log(userDatabase);

  res.redirect("/urls");
});

// Listen
app.listen(PORT, (req, res) => {
  console.log(`App is listening on ${PORT}!`);
});