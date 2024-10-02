const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';

  for (let i = 0; i < 6; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return randomStr;
};
let loginVal = false;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls",(req,res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies["username"],
    loginVal: loginVal,
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies["username"],
    loginVal: loginVal,
   };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req,res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});
app.post("/urls/:id/edit", (req,res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

app.post("/login", (req,res) =>{
  const username = req.body.username;
  res.cookie("username",username);
  loginVal = true;
  res.redirect('/urls');
});
app.post("/logout", (req,res) =>{
  res.clearCookie('username');
  loginVal = false;
  res.redirect('/urls');
});




