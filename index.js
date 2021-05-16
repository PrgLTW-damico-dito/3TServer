const express = require('express');
const  dbUtenti = require('./utentiDB.js');
const util = require('./util.js');
const dbPartite = require('./partiteDB.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

global.clientTimeOut = new Map();

setInterval(() => {
    clientTimeOut.forEach( (element, key) => {
        const delta = (Date.now() - element)/1000;
        console.log(`id: ${key} delta: ${delta}` );
        if (delta > 20 ){
            dbPartite.assegnaVittoria(key);
        }

    });
}, 10000);

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