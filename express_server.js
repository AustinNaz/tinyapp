const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

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
    username: req.cookies['username']
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase,
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL:  urlDatabase[req.params.shortURL],
    username: req.cookies['username']
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase,
  }
  delete urlDatabase[req.params.shortURL];
  res.render("urls_index", templateVars)
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase,
  }
  urlDatabase[req.params.shortURL] = req.body['longURL']
  res.render("urls_index", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  // console.log(typeof urlDatabase[req.params.shortURL])
  res.redirect(urlDatabase[req.params.shortURL])
})

app.post("/urls", (req, res) => {
  let urlVars = {
    shortURL: String(generateRandomString()),
    longURL: req.body.longURL,
    username: req.cookies['username'] 
  }
  res.render("urls_show", urlVars)
  res.send(urlDatabase[urlVars['shortURL']] = urlVars['longURL']);   
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  let templateVars = {
    urls: urlDatabase,
    // username: req.cookies['username']
  }
  res.redirect("/urls/");
  // console.log(req.body);
})

app.post("/logout", (req, res) => {
  // res.cookie('username', req.body.username);
  res.clearCookie('username')
  let templateVars = {
    urls: urlDatabase,
  }
  res.redirect("/urls/");
  // console.log(req.body);

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const length = 6;
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}