const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString } = require("./helperFunctions");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString(5)]
}));



// const generateRandomString = function() {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let randomString = '';
  
//   for (let i = 0; i < 6; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     randomString += characters.charAt(randomIndex);
//   }

//   return randomString;
// };

// URL Database

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  const loggedInUser = UserDatabase[req.session.user_id];

  if (!loggedInUser) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: loggedInUser
  };
  res.render("urls_new", templateVars);
});

// Post New URL
app.post("/urls", (req, res) => {
  const loggedInUser = UserDatabase[req.session.user_id];
  if (!loggedInUser) {
    return res.send("You cannot shorten URLs wihtout logging in.");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: loggedInUser.id };
  res.redirect(`/urls`);
});



// Specific URL
app.get('/urls/:id', (req, res) => {
  const loggedInUser = UserDatabase[req.session.user_id];
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


// Garbage?
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Edit URL

app.post(`/urls/:id`, (req, res) => {
  const loggedInUser = UserDatabase[req.session.user_id];
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


// Delete a URL post route
app.post('/urls/:shortURL/delete', (req, res) => {
  const loggedInUser = UserDatabase[req.session.user_id];
  
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
  const loggedInUser = UserDatabase[req.session.user_id];
  
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

// Redirects to actual long URL of the short URL ID
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!urlDatabase[req.params.id]) {
    res.send("URL does not exist.");
  }

  res.redirect(longURL);
});

// All URLs
app.get('/urls', (req, res) => {
  const loggedInUser = UserDatabase[req.session.user_id];
  if (!loggedInUser) {
    return res.send("Please log in or register to view short URLs");
  }

  // Add to helperFunction***
  const urlsForUser = function(id) {
    let userURLs = {};
    for (let shortURL in urlDatabase) {
      const url = urlDatabase[shortURL];
      if (url.userID === id) {
        userURLs[shortURL] = url;
      }
    }
    return userURLs;
  };

  const userURLs = urlsForUser(loggedInUser.id);
  
  const templateVars = {
    user: loggedInUser,
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});


// Get route for login

app.get("/login", (req, res) => {
  const loggedInUser = UserDatabase[req.session.user_id];
  const templateVars = {
    user: loggedInUser
  };

  // req.session = null;

  res.render("login", templateVars);
});


// Post Route for Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let userID = getUserByEmail(email, UserDatabase);

  if (userID) {
    const hashedPassword = UserDatabase[userID].password;

    if (!bcrypt.compareSync(password, hashedPassword)) {
      return res.send("Incorrect Password");
    }
  } else {
    res.status(403);
    res.send("User account does not exist.");
    return res.redirect('/login');
  }

  req.session.user_id = userID;
  return res.redirect("/urls");
});




// Post route for Logout

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// Get Route for Registration Form

app.get("/register", (req, res) => {
  const loggedInUser = UserDatabase[req.session.user_id];
  
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
  const password = bcrypt.hashSync(req.body.password, 10);
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

  req.session.user_id = id;

  console.log(UserDatabase);

  res.redirect("/urls");
});



// Listen
app.listen(PORT, (req, res) => {
  console.log(`App is listening on ${PORT}!`);
});