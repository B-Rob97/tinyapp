const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};

// URL Database

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// User Database

const UserDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

// Home
app.get('/', (req, res) => { // * Will need to change this *
  res.send('Hello!');
});

// New
app.get("/urls/new", (req, res) => {
  const loggedInUser = UserDatabase[req.cookies['user_id']];
  const templateVars = {
    user: loggedInUser
  };
  res.render("urls_new", templateVars);
});

// If the user is not logged in, redirect GET /urls/new to GET /login
// If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs. Double check that in this case the URL is not added to the database.

// Post New URL
app.post("/urls/", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/`);
});

// All URLs
app.get('/urls', (req, res) => {
  const loggedInUser = UserDatabase[req.cookies['user_id']];
  const templateVars = {
    user: loggedInUser,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Specific URL
app.get('/urls/:id', (req, res) => {
  const loggedInUser = UserDatabase[req.cookies['user_id']];
  const templateVars = {
    user: loggedInUser,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
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

// Get route for login

app.get("/login", (req, res) => {
  const loggedInUser = UserDatabase[req.cookies['user_id']];

  if (loggedInUser) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: loggedInUser
  };
  res.render("login", templateVars);
});


// If the user is logged in, GET /login should redirect to GET /urls
// If the user is logged in, GET /register should redirect to GET /urls

// Post Route for Login

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  for (let userID in UserDatabase) {
    if (email === UserDatabase[userID].email && password === UserDatabase[userID].password) {
      res.cookie("user_id", userID);
      return res.redirect("/urls");
    }
  }

  res.status(403);
  res.send("Wrong Credentials");

});

// Post route for Logout

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// Get Route for Registration Form

app.get("/register", (req, res) => {
  const loggedInUser = UserDatabase[req.cookies['user_id']];
  
  if (loggedInUser) {
    return res.redirect("/urls");
  }
  
  const templateVars = {
    user: loggedInUser};

  res.render("registration", templateVars);

});

// Post Route for Registration

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();

  if (email.length === 0 || password.length === 0) {
    res.status(400);
    return res.send("Please enter a valid email and/or password");
  }

  for (let userID in UserDatabase) {
    if (email === UserDatabase[userID].email) {
      res.status(400);
      return res.send("Email already registered.");
    }
  }
  
  const newUser = {
    id,
    email,
    password
  };

  UserDatabase[id] = newUser;

  res.cookie("user_id", id);

  console.log(UserDatabase);

  res.redirect("/urls");
});


// Listen
app.listen(PORT, (req, res) => {
  console.log(`App is listening on ${PORT}!`);
});