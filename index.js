const express = require('express');
const app = express();
const  dbUtenti = require('./utentiDB.js');
const util = require('./util.js');
const dbPartite = require('./partiteDB.js');

app.use(express.json());

//UTENTE
app.get('/utenti', dbUtenti.getUsers);
app.get('/utenti/:id([0-9]*)', dbUtenti.getUserById);
app.post('/utenti', dbUtenti.createUser);
app.put('/utenti/login', dbUtenti.postUserLogin);
app.put('/utenti', dbUtenti.updateUser);
app.put('/utenti/logout', dbUtenti.updateStateLogout);
app.delete('/utenti', dbUtenti.deleteUser);



//PARTITA
app.get('/partite', dbPartite.getPartite);
app.get('/partite/:id', dbPartite.getPartitaById);
app.post('/partite', dbPartite.createPartita);
app.put('/partite', dbPartite.putMove);


app.all("*", (req,res) => {
    res.status(400).send(util.parseMsg("endpoints non esistente", "error"))
});


app.listen(process.env.PORT || 3000);