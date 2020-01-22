const express = require("express");
let cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let users = {};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

app.get("/authentication/:auth", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase,
    auth: req.params.auth,
  };
  console.log(users);
  res.render("urls_authentication", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL:  urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase,
  };
  delete urlDatabase[req.params.shortURL];
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase,
  };
  urlDatabase[req.params.shortURL] = req.body['longURL'];
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post("/urls", (req, res) => {
  let urlVars = {
    shortURL: String(generateRandomString()),
    longURL: req.body.longURL,
    user: users[req.cookies['user_id']],
  };
  res.send(urlDatabase[urlVars['shortURL']] = urlVars['longURL']);
  res.render("urls_show", urlVars);
});

// app.post("/login", (req, res) => {
//   // res.cookie('username', req.body.username);
//   let templateVars = {
//     urls: urlDatabase,
//     // username: req.cookies['username']
//   }
//   res.redirect("/urls/");
// });

app.post("/authentication/:auth", (req, res) => {
  let userId;
  const auth = req.params.auth;
  
  if (!req.body.email || !req.body.password) {
    res.statusCode = 404;
  }
    
  if (auth === 'register') {
    if (Object.keys(users).length > 0) {
      for (const ids in users) {
        userId = ids;
        if (users[userId]['email'] === req.body.email) {
          res.statusCode = 403;
          console.log('same emails');
          break;
        } else {
          userId = generateRandomString();
          users[userId] = {
            id: userId,
            email: req.body.email,
            password: req.body.password
          };
          res.statusCode = 200;
        }
      }
    } else {
      userId = generateRandomString();
      users[userId] = {
        id: userId,
        email: req.body.email,
        password: req.body.password
      };
      res.statusCode = 200;
    }

  } else if (auth === 'login') {
    if (Object.keys(users).length > 0) {
      for (const ids in users) {
        userId = ids;
        if (!userId || users[userId]['email'] !== req.body.email || users[userId]['password'] !== req.body.password) {
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

  if (res.statusCode === 200) {
    res.cookie('user_id', users[userId].id);
    return res.redirect("/urls/");
  } else {
    res.send(res.statusCode);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');

  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  const length = 6;
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
};