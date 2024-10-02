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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "5678",
  },
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
  const userId = req.cookies["userId"];
  const user = users[userId];
  const templateVars = { urls: urlDatabase,
   user:user,
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  const user = users[userId];
  const templateVars = { urls: urlDatabase,
    user: user,
    loginVal: loginVal,
   };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["userId"];

  const user = users[userId];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user:user };
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
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('you must provide an email and a password')
  }
  let foundUser = null;

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  if (!foundUser) {
    return res.status(400).send('the email you provided does not exist');
  }
  if (foundUser.password !== password) {
    return res.status(400).send('the passwords dont match');
  }
  res.cookie('userId', foundUser.id);
  res.redirect('/urls');

});
app.post("/logout", (req,res) =>{
  res.clearCookie('userId');
  res.redirect('/urls');
});

app.get("/register", (req,res) => {
  const userId = req.cookies["userId"];
  const user = users[userId];
  const templateVars = {user: user};
  res.render("register",templateVars);
});

app.post("/register",(req,res) =>{
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: password
  }
  users[id] = newUser;
  res.cookie('userId', id);
  res.redirect('/urls');
});




