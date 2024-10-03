const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const getUserByEmail = require("./helpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
}));

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';

  for (let i = 0; i < 6; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return randomStr;
};


const ulrsForUser = (id) => {
  const userUrls = {};
  for (const ulrId in urlDatabase) {
    if (urlDatabase[ulrId].ulrId === id) {
      userUrls[ulrId] = urlDatabase[ulrId];
    }
  }
  return userUrls;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    ulrId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    ulrId: "aJ48lWW",
  },
};

const users = {
};
app.get("/", (req, res) => {
  res.redirect("/login");
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
  const userId = req.session["userId"];
  if (!userId) {
   
    return res.status(401).send('you must be signed in to see this page');
  }
  const user = users[userId];
  const userURLS = ulrsForUser(userId);
  const templateVars = { user: user, urls: userURLS };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
   
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = { urls: urlDatabase,
    user: user,
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session["userId"];
  if (!userId) {
    return res.status(401).send('you must be signed in to see this page');
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(403).send("The URL you trying reach does not exist");
  }
  if (url.ulrId !== userId) {
    return res.status(403).send("You dont have permission to view this page");
  }
  const user = users[userId];
  const templateVars = { id: req.params.id, longURL: url.longURL, user:user };
  res.render("urls_show", templateVars);
});



app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.send(`${id} Does not exist`);
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
   
    return res.status(401).send('you must be signed in to see this page');
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL:longURL,
    ulrId: userId
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req,res) => {
  const userId = req.session["userId"];
  const url = urlDatabase[req.params.id];
  if (!userId) {
    return res.status(401).send("You must be logged in to delete URLs.");
  }
  if (!url) {
    return res.status(404).send("The URL you're trying to delete does not exist.");
  }
  if (url.ulrId !== userId) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.post("/urls/:id/edit", (req,res) => {
  const userId = req.session["userId"];
  const url = urlDatabase[req.params.id];
  
  if (!userId) {
    return res.status(401).send("You must be logged in to edit URLs.");
  }
  if (!url) {
    return res.status(404).send("The URL you're trying to edit does not exist");
  }
  if (url.ulrId !== userId) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }
  const newURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = newURL;
  res.redirect('/urls');
});

app.post("/login", (req,res) =>{
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('you must provide an email and a password');
  }
  let foundUser = null;

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  if (!foundUser) {
    return res.status(403).send('the email you provided does not exist');
  }
  const result = bcrypt.compareSync(password, foundUser.password);
  if (!result) {
    return res.status(403).send('the passwords dont match');
  }
  req.session.userId = foundUser.id;
  res.redirect('/urls');

});
app.post("/logout", (req,res) =>{
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req,res) => {
  const userId = req.session['userId'];
  if (userId) {
    return res.redirect('/urls');
  }
  res.render('register', {userId});
});

app.post("/register",(req,res) =>{
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('you must provide an email and a password');
  }
  let foundUser = getUserByEmail(email,users);

  if (foundUser) {
    return res.status(400).send('email already exists');
  }
  const id = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const newUser = {
    id: id,
    email: email,
    password: hash
  };
  users[id] = newUser;
  req.session.userId = id;
  res.redirect('/urls');
});

app.get('/login', (req,res) => {
  res.render('login');
});




