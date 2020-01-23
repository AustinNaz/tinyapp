const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let users = {};

// const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
//  };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = users[req.cookies['user_id']]
  let templateVars = {
    urls: urlsForUser(userID),
    user: userID,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  if (req.cookies['user_id']) {
    const userID = users[req.cookies['user_id']]
    let templateVars = {
      urls: urlsForUser(userID),
      user: userID,
    };

    res.render("urls_new", templateVars);
  } else {
    res.redirect("/authentication/login")
  }
  
});

app.get("/authentication/:auth", (req, res) => {
  const userID = users[req.cookies['user_id']]
  let templateVars = {
    // urls: urlsForUser(userID),
    user: userID,
    auth: req.params.auth,
  };
  // console.log(users);
  res.render("urls_authentication", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = users[req.cookies['user_id']]
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: (urlsForUser(userID))[req.params.shortURL],
    user: userID,
  };
  // let templateVars = {
  //   shortURL: req.params.shortURL,
  //   longURL:  urlDatabase[req.params.shortURL],
  //   user: users[req.cookies['user_id']],
  // };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = users[req.cookies['user_id']]
  const shortUrl = generateRandomString();
  const longUrl = req.body.longURL;

  let templateVars = {
    urls: urlsForUser(userID),
    user: userID,
    shortURL: shortUrl,
    longURL: longUrl,
  };

  urlDatabase[shortUrl] = {
    longURL: longUrl,
    userID: userID
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = users[req.cookies['user_id']]
  const userUrls = urlsForUser(userID);

  for (shortUrl in userUrls) {
    if (shortUrl === req.params.shortURL) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect("/urls/");
    }
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = users[req.cookies['user_id']];
  const userUrls = urlsForUser(userID);

  for (shortUrl in userUrls) {
    if (shortUrl === req.params.shortURL) {
      urlDatabase[req.params.shortURL] = {
        longURL: req.body['longURL'],
        userID: userID};
      return res.redirect("/urls/");
    }
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]['longURL']);
});

app.post("/authentication/:auth", (req, res) => {
  let userId;
  const auth = req.params.auth;
  
  if (!req.body.email || !req.body.password) {
    res.statusCode = 404;
    return res.send(res.statusCode)
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
    if (Object.keys(users).length > 0) {
      for (const ids in users) {
        userId = ids;
        if (!userId || users[userId]['email'] !== req.body.email || !bcrypt.compareSync(req.body.password, users[userId]['password'])) {
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

const urlsForUser = function(id) {
  const results = {};
  for (urls in urlDatabase) {
    if (urlDatabase[urls]['userID'] === id) {
      results[urls] = urlDatabase[urls]['longURL'];
    }
  }
  return results;
}