const pool = require('./managerDB.js');
const util = require('./util.js');


//GET all users
exports.getUsers = (req, res) => {
    const idUser = req.query.id;
   
    let payload={
        utenti : undefined,
        partita : undefined,
    };
    console.log("getUser");
    pool.query('UPDATE utente SET stato = 1 WHERE id = $1', [idUser]);
    pool.query('SELECT id, username, stato, perse, vinte, patte FROM utente ', (error, res1) =>{
        if(error){
            res.status(400).send(util.parseMsg(error.message));
            return;
        }
        else{
            console.log(idUser);
            pool.query(`SELECT * FROM partita WHERE 
                risultato = 0 AND (idx = $1 OR ido = $1) AND mossa = '000000000'`,[idUser],
            (error, res2) => {
                if(error){
                    console.log(error);
                    res.status(400).send(util.parseMsg(error.message));
                    return;
                }
                else if (res2.rowCount != 0){
                    payload.partita = res2.rows[0];

                }
                payload.utenti = res1.rows;
                res.status(200).json(payload);
                return;
            })
            
            
        }
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
            res.status(400).send(util.parseMsg("Utente gia esistente"));
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
            res.status(200).send(util.parseMsg("Password cambiata correttamente!"));
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
            return;
        }
       
        if(results.rowCount === 0){
            res.status(401).send(util.parseMsg("utente non registrato"));
            return;
        }
    
        checkPassword(username, password, res);
        
        
    });
}

//verifico se password corrisponde
//cambio lo stato dell'utente in online(1)
function checkPassword(username, password, res){
    pool.query('SELECT id, username, stato, vinte, perse, patte FROM utente WHERE password = $1 AND username = $2',
                 [password, username],(error, results) => {
        if(error){
            res.status(400).send(util.parseMsg(error.message));
            return;
        }
        if (results.rowCount === 0){
            res.status(401).send(util.parseMsg("password non corretta"));
            return;
        }
    
        changeState(username);
        res.status(200).json(results.rows[0]);
        
        

    });
}

function changeState(username) {
    pool.query('UPDATE utente SET stato = 1 WHERE username = $1',[ username],
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

    pool.query('UPDATE utente SET stato = 0 WHERE username = $1 AND password = $2 RETURNING id',
                [username, password],
                (error, results) => {
                    
        if(error){
            res.status(400).send(util.parseMsg(error.message));
        }
        else if (results.rowCount === 0){
            res.status(401).send(util.parseMsg("utente non riconosciuto"));
        } 
        else{
            
            res.status(200).send(util.parseMsg("utente disconnesso", {username: username}));
            
        }
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
        else{
            res.clearCookie(results.rows[0].id);
            res.status(200).send(util.parseMsg("utente rimosso con successo"));
        }
    });
}

