const express = require('express');
const  dbUtenti = require('./utentiDB.js');
const util = require('./util.js');
const dbPartite = require('./partiteDB.js');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(cors());

global.clientChat = new Map();


global.clientTimeOut = new Map();

setInterval(() => {
    clientTimeOut.forEach( (element, key) => {
        const delta = (Date.now() - element)/1000;
        console.log(`setInterval() id: ${key} delta: ${delta}` );
        if (delta > 20 ){
            dbPartite.assegnaVittoria(key);
        }

    });
}, 20000);

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
app.get('/partite/:id([0-9]*)', dbPartite.getPartitaById);
app.post('/partite', dbPartite.createPartita);
app.put('/partite', dbPartite.putMove);
app.put('/partite/chat', dbPartite.putMessage);


app.all("*", (req,res) => {
    res.status(400).send(util.parseMsg("endpoints non esistente", "error"))
});


app.listen(process.env.PORT || 3000);