// Creates a random 6 alpha-numeric string
const generateRandomString = function() {
  const length = 6;
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
};

// Iterates over all the urls and returns back the users urls that has their Id passed in
const urlsForUser = function(userId, urlObjects) {
  const results = {};
  for (const urls in urlObjects) {
    if (urlObjects[urls]['userID'] === userId) {
      results[urls] = urlObjects[urls]['longURL'];
    }
  }
  return results;
};

// Not acually using this function in my code, only made it because compass said we needed to test it
// const getUserByEmail = function(email, userObjects) {
//   for (const user in userObjects) {
//     if (userObjects[user]['email'] === email) {
//       const userObject = user;
//       return userObject;
//     }
//   }
//   return null;
// };

// Clean up all my template vars into a function that takes in the 3 just about always used propertys, handles error codes that need to be passed to the website, and an extraObj if theres more that need to passed through
const temVars = function(userId, userDb, urlDb, errorCode, extraObj) {
  const templateVars = {
    user: userDb[userId],
    urls: urlsForUser(userId, urlDb),
    errorFunc: function(errorCode) {
      if (errorCode !== 200) {
        if (errorCode === 400) {
          console.log('here');
          return templateVars['error'] = {
            errorKey: 'Welcome',
            errorMsg: "Welcome to TinyApp, a website that lets you shorten your urls for easier access, which you can also share with other people. Please login or Register."
          };
        } else if (errorCode === 401) {
          return templateVars['error'] = {
            errorKey: "Error " + errorCode,
            errorMsg: "Whoops, Looks like somethings wrong, please go back."
          };
        } else if (errorCode === 402) {
          return templateVars['error'] = {
            errorKey: "Error " + errorCode,
            errorMsg: "Whoops, look likes somethings gone wrong, maybe you entered something wrong."
          };
        } else if (String(errorCode)[0] === '4') {
          return templateVars['error'] = {
            errorKey: "Error " + errorCode,
            errorMsg: "Whoops, Looks like you dont have access to this page, pleaes Login or Register."
          };
        } else if (String(errorCode)[0] === '5') {
          return templateVars['error'] = {
            errorKey: "Error " + errorCode,
            errorMsg: "Whoops, Looks like the server went on a lunch break, please try again later."
          };
        }
      }
    }
  };

  for (const key in extraObj) {
    templateVars[key] = extraObj[key];
  }
  return templateVars;
};

// Just to clean up code a bit
const temError = function(res, templateVars, errorCode) {
  res.status(errorCode);
  templateVars.errorFunc(errorCode);
};

module.exports = { generateRandomString, urlsForUser, temVars, temError};