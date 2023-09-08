const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (email === database[userID].email) {
      return userID;
    }
  }
};

const generateRandomString = function() {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
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
