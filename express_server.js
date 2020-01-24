const express = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { generateRandomString, urlsForUser, temVars, temError, httpUrl} = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'user_id',
  keys: ['Noahs a Genius', 'So is Austin'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

// Create a global users and urlDatabase objects to fake persistence while server is running
const users = {};
const urlDatabase = {};

// Check if logged in, otherwise redirect to login page
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls/");
  }
  return res.redirect("/authentication/login");
});

// Main landing page
app.get("/urls", (req, res) => {
  const templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);

  if (req.session.user_id) {
    temError(res, templateVars, 200);
    return res.render("urls_index", templateVars);
  } else {
    temError(res, templateVars, 400);
    return res.render("urls_error", templateVars);
  }
});

// Only allow tinyUrls to be created if there is a user logged in
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/authentication/login");
  }
});

// Catch for either the Register or Login GETS, and passes it on to the view
app.get("/authentication/:auth", (req, res) => {
  if (!req.session.user_id) {
    const auth = { auth: req.params.auth };
    const templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode, auth);
    return res.render("urls_authentication", templateVars);
  }
  return res.redirect("/urls/");
});

// Shows the information about the tinyURL, could alter templateVars and remove urls, but seems like its not worth it.
app.get("/urls/:shortURL", (req, res) => {
  let templateVars;
  if (req.session.user_id) {
    if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
      const urls = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]['longURL'],
      };
      templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode, urls);
      temError(res, templateVars, 200);
      return res.render("urls_show", templateVars);
    } else {
      templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);
      temError(res, templateVars, 403);
      return res.render("urls_error", templateVars);
    }
  }
  templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);
  temError(res, templateVars, 404);
  return res.render("urls_error", templateVars);
});

// Post is catching when a user creates a new tinyURL, then add it to the urlDatabase
app.post("/urls", (req, res) => {
  let templateVars;

  if (req.session.user_id) {
    const shortUrl = generateRandomString();
    const longUrl = httpUrl(req.body.longURL);
    const urls = {
      shortURL: shortUrl,
      longURL: longUrl,
    };
    
    templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode, urls);

    urlDatabase[shortUrl] = {
      longURL: longUrl,
      userID: req.session.user_id
    };
    temError(res, templateVars, 200);
    return res.render("urls_show", templateVars);
  }
  
  templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);
  temError(res, templateVars, 403);
  return res.render("urls_error", templateVars);
});

// Deletes a url that a user created themselves
app.post("/urls/:shortURL/delete", (req, res) => {
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);

  if (req.session.user_id) {
    for (const shortUrl in userUrls) {
      if (shortUrl === req.params.shortURL) {
        delete urlDatabase[req.params.shortURL];
        return res.redirect("/urls/");
      }
    }
    temError(res, templateVars, 403);
    return res.render("urls_error", templateVars);
  }
  temError(res, templateVars, 404);
  return res.render("urls_error", templateVars);
});

// Edits a url that a user created themselves
app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);

  if (req.session.user_id) {
    for (const shortUrl in userUrls) {
      if (shortUrl === req.params.shortURL) {
        urlDatabase[req.params.shortURL] = {
          longURL: httpUrl(req.body['longURL']),
          userID: userID};
        return res.redirect("/urls/");
      }
    }
    temError(res, templateVars, 403);
    return res.render("urls_error", templateVars);
  }
  temError(res, templateVars, 404);
  return res.render("urls_error", templateVars);
});

// Redirects when going straight to a shortURL
app.get("/u/:shortURL", (req, res) => {
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.redirect(urlDatabase[req.params.shortURL]['longURL']);
  } else {
    const templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);
    temError(res, templateVars, 400);
    return res.render("urls_error", templateVars);
  }
});

// Catch both posts for Register or Login and Authenticate them, can be done better
app.post("/authentication/:auth", (req, res) => {
  let userId;
  const auth = req.params.auth;
  const templateVars = temVars(req.session.user_id, users, urlDatabase, res.statusCode);
  
  if (!req.body.email || !req.body.password) {    // If either email or password inputted are empty return an error page
    temError(res, templateVars, 401);
    return res.render("urls_error", templateVars);
  }
  
  if (auth === 'register') {
    if (Object.keys(users).length > 0) {  // Check if there is objects in the user object
      for (const ids in users) {
        userId = ids;
        if (users[userId]['email'] === req.body.email) {    // If an email already exists throw an error
          res.statusCode = 403;
          console.log('same emails');
          break;
        } else {
          userId = generateRandomString();
          users[userId] = {
            id: userId,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
          };
          res.statusCode = 200;
        }
      }
    } else {
      userId = generateRandomString();
      users[userId] = {
        id: userId,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      res.statusCode = 200;
    }

  } else if (auth === 'login') {
    if (Object.keys(users).length > 0) {    // If there is more than one user in the users object
      for (const ids in users) {
        userId = ids;
        if (!userId || users[userId]['email'] !== req.body.email || !bcrypt.compareSync(req.body.password, users[userId]['password'])) {    // Make sure the email and passwords match
          res.statusCode = 403;
        } else {
          res.statusCode = 200;
          break;
        }
      }
    } else {
      res.statusCode = 403;
    }
  }

  if (res.statusCode === 200) {   // Authenticate and create cookies if statuscode is still 200
    req.session.user_id = users[userId].id;
    return res.redirect("/urls/");
  } else {
    temError(res, templateVars, 401);
    return res.render("urls_error", templateVars);
  }
});

// Logout and clear the session
app.post("/logout", (req, res) => {
  req.session = null;

  return res.redirect("/urls/");
});

// Listen in on the port specified
app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});

