const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (email === database[userID].email) {
      return userID;
    }
  }
};

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};

const urlsForUser = function(id, urlDatabase) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      userURLs[shortURL] = url;
    }
  }
  return userURLs;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser };


// .email && password === UserDatabase[userID].password
// res.cookie("user_id", userID);
//       return res.redirect("/urls");

// } else if (email === UserDatabase[userID].email && password !== UserDatabase[userID].password) {
//   res.status(403);
//   return res.send("Password does not match account on file.");
// }