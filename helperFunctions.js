const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (email === database[userID].email) {
      return userID;
    }
  }
};


module.exports = getUserByEmail;


// .email && password === UserDatabase[userID].password
// res.cookie("user_id", userID);
//       return res.redirect("/urls");

// } else if (email === UserDatabase[userID].email && password !== UserDatabase[userID].password) {
//   res.status(403);
//   return res.send("Password does not match account on file.");
// }