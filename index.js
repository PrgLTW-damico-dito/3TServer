const express = require('express');
const app = express();
const  db = require('./queries');
const util = require('./util.js');

app.use(express.json());

app.get('/utenti', db.getUsers);
app.get('/utenti/:id([0-9]*)', db.getUserById);


app.post('/utenti', db.createUser);

app.put('/utenti/login', db.postUserLogin);
app.put('/utenti', db.updateUser);
app.put('/utenti/logout', db.updateStateLogout);

app.delete('/utenti', db.deleteUser);

app.all("*", (req,res) => {
    res.status(400).send(util.parseMsg("endpoints non esistente", "error"))
});


app.listen(process.env.PORT || 3000);