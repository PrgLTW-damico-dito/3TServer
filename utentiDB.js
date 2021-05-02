const pool = require('./managerDB.js');
const util = require('./util.js');


//GET all users
exports.getUsers = (req, res) => {
    console.log("getUser");
    pool.query('SELECT id, username, stato, perse, vinte, patte FROM utente WHERE stato > 0', (error, results) =>{
        if(error){
            res.status(400).send(util.parseMsg(error.message));
        }
        else
            res.status(200).json(results.rows);
    });
}

//GET users by ID
exports.getUserById = (req, res) => {
    console.log("getUserById");
    const id = parseInt(req.params.id);
    
    pool.query('SELECT id, username, stato, perse, vinte, patte FROM utente WHERE id = $1', [id], (error, results) => {
        if(error){
            res.status(400).send(util.parseMsg(error.message));
        }
        else if (results.rowCount === 0){
            res.status(401).send(util.parseMsg("Utente non esistente"));
        }
        else
            res.status(200).json(results.rows[0]);
    });
}

//POST a new users
exports.createUser = (req, res) => {
    console.log("createUser");
    const username = req.body.username;
    const password = req.body.password;
  
    pool.query( `INSERT INTO utente (username, password) VALUES ($1, $2)
                 RETURNING username, stato`,
                [username, password], 
                (error, results) => {
        if(error){
            res.status(400).send(util.parseMsg(error.message));
        }
        else
            res.status(200).json(results.rows[0]);

    });
}

//PUT udated data in existing user
exports.updateUser = (req, res) => {
    console.log("updateUser");
    const username = req.body.username;
    const password = req.body.password;

    pool.query('UPDATE utente SET password = $1 WHERE username = $2 RETURNING id, username, stato', 
                [password, username],
                (error, results) => {
                    
                    if(error){
                        res.status(400).send(util.parseMsg(error.message));
                    }
                    else if(results.rowCount === 0) 
                        res.status(401).send(util.parseMsg("utente non trovato"));
                    else
                        res.status(200).send(results.rows[0]);
    });
}

exports.postUserLogin = (req, res) => {
    console.log("postUserLogin")
    const username = req.body.username;
    const password = req.body.password;
    
    pool.query('SELECT * FROM utente WHERE username = $1',
                [username], (error, results) => {
        if(error){
            res.status(400).send(util.parseMsg(error.message));
        }
       
        else if(results.rowCount === 0){
            
            res.status(401).send(util.parseMsg("utente non registrato"));
        }
        else
            checkPassword(username, password, res);
    });
}

//verifico se password corrisponde
//cambio lo stato dell'utente in online(1)
function checkPassword(username, password, res){
    pool.query('SELECT id, username, stato FROM utente WHERE password = $1 AND username = $2',
                 [password, username],(error, results) => {
            if(error)
                res.status(400).send(util.parseMsg(error.message));
            
            else if (results.rowCount === 0){
                res.status(401).send(parseMsg("password non corretta"));
            }
            else{
                changeState(username);
                res.status(200).json(results.rows[0]);
            }    

    });
}

function changeState(username) {
    pool.query('UPDATE utente SET stato = $1 WHERE username = $2',[1, username],
                (error) => {
                if(error)
                    res.status(400).send(util.parseMsg(error.message));
                });
}

//PUT update state 
exports.updateStateLogout = (req, res) => {
    console.log("updateStateLogout");
    const username = req.body.username;
    const password = req.body.password;

    pool.query('UPDATE utente SET stato = $1 WHERE username = $2 AND password = $3',
                [0, username, password],
                (error, results) => {
                if(error){
                    res.status(400).send(util.parseMsg(error.message));
                }
                else if (results.rowCount === 0){
                    res.status(401).send(util.parseMsg("utente non riconosciuto"));
                } 
                else
                    res.status(200).send(util.parseMsg("utente disconnesso"));

    });
}

//DELETE a user
exports.deleteUser = (req, res) => {
    console.log("deleteUser");
    const username = req.body.username;
    const password = req.body.password;

    pool.query('DELETE FROM utente WHERE username = $1 AND password = $2',
                [username, password],
                (error, results) =>{
                    if(error){
                        res.status(400).send(util.parseMsg(error.message));
                    }
                    else if(results.rowCount === 0){
                        res.status(401).send(util.parseMsg("utente non esistente"));    
                    }
                    else
                        res.status(200).send(util.parseMsg("utente rimosso con successo"));
                });
}

