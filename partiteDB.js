const pool = require('./managerDB.js');
const util = require('./util.js');

exports.getPartite = (req, res) => {
     pool.query('SELECT * FROM partita WHERE risultato = 0',
                (error, results) => {

        if(error){
            res.status(400).send(util.parseMsg(error.message));
        }
        else{
            res.status(200).json(results.rows);
        }

    });
}

exports.getPartitaById = (req, res) => {
    const id = parseInt(req.params.id);
    const clientId = req.query.id;
    let payload = {
        chat: undefined,
        partita: undefined
    }

    
    pool.query('SELECT * FROM partita WHERE id = $1', [id],
        (error, results) => {
            if(error){
                res.status(400).send(util.parseMsg(error.message));
            }
            else if(results.rowCount === 0){
                res.status(401).send(util.parseMsg("Partita non trovata"));
            }
            else{
                payload.partita = results.rows[0];  
                payload.chat = clientChat.get(id) ? clientChat.get(id) : [] 
                res.status(200).json(payload);

                if (payload.partita.risultato == 0){
                    console.log('clientTimeOut setted', clientId);
                    clientTimeOut.set(clientId, Date.now());
                }

            }
    });
}

exports.createPartita = (req, res) => {
    const id1 = req.body.id1;
    const id2 = req.body.id2;

    if(id1 === id2){
        res.status(400).send(util.parseMsg("un utente non può giocare con se stesso"));
        return;
    }
    pool.query(`SELECT u1.username as userx, u2.username as usero
        FROM utente u1, utente u2 
        WHERE (u1.id = $1 AND u1.stato = 1) 
                AND (u2.id = $2 AND u2.stato = 1) `, [id1, id2],
        (error, results) =>{
        
        if(error){
            res.status(400).send(util.parseMsg(error.message));
            return;
        }
        if(results.rowCount == 0){
            res.status(400).send(util.parseMsg("impossibile creare partita, giocatori offline, non esistenti oppure partita in corso"));
            return;
        }
    
        let userX = results.rows[0].userx;
        let userO = results.rows[0].usero;
        pool.query(`INSERT INTO partita (idX, idO, userx, usero) VALUES ($1, $2, $3, $4)
                    RETURNING id, idX, idO, userx, usero, mossa, risultato, dataOra`, [id1, id2, userX, userO],
                    (error, results) => {
                        
            if(error){
                res.status(400).send(util.parseMsg(error.message));
                return;
            }
            
            pool.query(`UPDATE utente SET stato = 2 WHERE id=$1 or id = $2 `, [id1, id2],
                (error) => {
                    if(error){
                        res.status(400).send(util.parseMsg(error.message));
                        return;
                    }
                    clientTimeOut.set(id1 + '', Date.now());
                    clientTimeOut.set(id2 + '', Date.now());
                    res.status(200).json(results.rows[0]);
            });
        });
        
    });

}


exports.putMessage = (req, res) => {
    const id = req.body.id;
    const id_player = req.body.id_player;
    const msg = req.body.msg;

    pool.query('SELECT * FROM partita WHERE id = $1 AND (idx = $2 OR ido=$2) AND risultato = 0', [id, id_player], (error, results) =>{
        if(error){
            res.status(400).send(util.parseMsg(error.message));
            return;
        }
        if(results.rowCount === 0){
            res.status(401).send(util.parseMsg("partita inesistente oppure giocatore non in partita"));
            return;
        }
        
        res.status(200).json(util.setClientChat(id, id_player, msg));
    })

}

exports.putMove = (req, res) => {
    console.log("putMove");
    const id = req.body.id;
    const mossa = req.body.mossa;
    
    let arr;
    let risultato;

    pool.query('SELECT * FROM partita WHERE id=$1', [id],
                (error, results) => {
        if(error){
            res.status(400).send(util.parseMsg(error.message));
            return;
        }
        if (results.rowCount === 0){
            res.status(401).send(util.parseMsg("partita non esistente"));
            return;
        }
        if (results.rows[0].risultato !== 0){
            res.status(401).send(util.parseMsg("partita terminata", results.rows[0]));
            return;
        }
        
        let mossaDB = results.rows[0].mossa;
        
        if( parseInt(mossaDB.charAt(mossa)) !==  0){
            res.status(401).send(util.parseMsg("mossa non autorizzata", results.rows[0]));    
            return;
        }
            
        arr = Array.from(mossaDB);
        seq = Math.max(...arr) + 1;
        arr[mossa] = seq
        
        risultato = checkPlay(arr, mossa, seq);

        pool.query(`UPDATE partita SET risultato=$1, mossa = $2 WHERE id = $3 
                    RETURNING id, idX, idO, mossa, risultato`,
                    [risultato, arr.join(''), id],
                    (error, results) => {
            if(error)
                res.status(400).send(util.parseMsg(error.message));
            else{
                if(risultato == 0){
                    res.status(200).json(results.rows[0]);
                }        
                else if(risultato == 1){
                    changeScore(results.rows[0].idx, results.rows[0].ido, res, results.rows[0] );
                }
                else if (risultato == 2){
                    changeScore(results.rows[0].ido, results.rows[0].idx, res, results.rows[0])

                }
                else if (risultato == 3){
                    pool.query(`UPDATE utente SET patte = patte +1, stato = 1  WHERE id = $1 or id = $2 `,
                        [results.rows[0].ido, results.rows[0].idx], (error) => {
                        if(error)
                            res.status(400).send(util.parseMsg(error.message));
                        else{
                            clientChat.delete(id);
                            res.status(200).json(results.rows[0]);

                            console.log("delete clientTimeout()");
                            clientTimeOut.delete(results.rows[0].ido + '');
                            clientTimeOut.delete(results.rows[0].idx + '');
                            pool.query('UPDATE utente SET stato = 0 WHERE id = $1 OR id = $2', 
                                [results.rows[0].ido, results.rows[0].idx]);
                       }
                    });
                   
                }
                
            }
                
        });
    });
            
}

function updateUtenteVittoria(vintoId, persoId){
    console.log('updateUtenteVittoria()', vintoId, persoId);
    pool.query(`UPDATE utente SET vinte = vinte + 1, stato = 1 WHERE id = $1`, [vintoId], (error) => {
        if(error) console.log("ERROR: ", error);
    });
    pool.query(`UPDATE utente SET perse = perse + 1, stato = 1 WHERE id = $1`, [persoId], (error) => {
        if(error) console.log("ERROR: ", error);
    });
}

exports.assegnaVittoria = clientId => {
    let idx, ido;
    pool.query(`UPDATE partita SET risultato=2 WHERE idx = $1 AND risultato=0 RETURNING idx, ido`,
        [clientId],
        (error, results) => {
        
            if(error) console.log("ERROR: ", error);
            else if (results.rowCount == 1){
                idx = results.rows[0].idx + '';
                ido = results.rows[0].ido + '';

                updateUtenteVittoria(results.rows[0].ido, clientId);

                console.log("delete clientTimeout()", idx, ido);
                clientTimeOut.delete(ido);
                clientTimeOut.delete(idx);

                pool.query('UPDATE utente SET stato = 0 WHERE id = $1 OR id = $2', 
                    [ido, idx]);

            }
    });

    pool.query(`UPDATE partita SET risultato=1 WHERE ido = $1 AND risultato=0 RETURNING idx, ido`,
        [clientId],
        (error, results) => {
            if(error) console.log("ERROR: ", error);
            else if (results.rowCount == 1){
                idx = results.rows[0].idx + '';
                ido = results.rows[0].ido + '';
                updateUtenteVittoria(results.rows[0].idx, clientId);

                console.log("delete clientTimeout()", idx, ido);
                clientTimeOut.delete(ido);
                clientTimeOut.delete(idx);

                pool.query('UPDATE utente SET stato = 0 WHERE id = $1 OR id = $2', 
                    [ido, idx]);

            }
    });


}


function changeScore(winner, loser, res, resRow){
    pool.query(`UPDATE utente SET  vinte = vinte+1, stato = 1 WHERE id = $1 `,
            [winner], (error) => {
        if(error)
            res.status(400).send(util.parseMsg(error.message));
        else{
            pool.query(`UPDATE utente SET  perse = perse+1, stato = 1 WHERE id = $1 `,
            [loser],(error) => {
                if(error)
                    res.status(400).send(util.parseMsg(error.message));
                else{
                    clientChat.delete(resRow.id);

                    clientTimeOut.delete(winner+'');
                    clientTimeOut.delete(loser+'');
                    
                    pool.query('UPDATE utente SET stato = 0 WHERE id = $1 OR id = $2', 
                    [winner, loser]);

                    
                    res.status(200).json(resRow);
                }
            });
        }
    });

}
  
function checkPlay( arr, mossa, seq){
    
    if(checkWinner(mossa, arr, seq)){
        if(seq%2 == 0){
            return 2;
        }
        return 1;
    }
    if(!checkWinner(mossa, arr, seq) && seq===9) //patta
        return 3;
    
    return 0;
    
}
    

function checkWinner(mossa, arr, seq) {
   
    let row = parseInt(mossa/3);
    let col = parseInt(mossa%3);
    console.log(`checkWinner() row: ${row}  col: ${col}`);

    //contorollo righe
    if (checkRow(row, arr, seq)) return true;
        
    //controllo colonne
    
    if(checkCol(col, arr, seq)) return true; 
    
    //contorollo diagonale
    //contorollo d1 [0,4,8]
    if(row === col){
        if (checkDiag(0, 9, 4, arr, seq)) return true; 
    }
    //contorollo d2 [2,4,6] 
    if(row + col === 2){
        if(checkDiag(2, 7, 2, arr, seq)) return true; 
    }
    return false;
}

function checkRow(r, arr, seq){
    
    //console.log("checkRow");
    let count = 0;
    
    for(let c=0; c<3; c++){
        let index_cell=(r+c)+(r*2);
        if(arr[index_cell] == 0) return false;
        if(!checkValue(parseInt(arr[index_cell]), seq)) return false;
    }
    return true;
}

function checkCol(c, arr, seq){
    let count = 0;
    //console.log("chechCol");
    for(let r=0; r<3; r++){
        let index_cell=(r+c)+(r*2)
        if(arr[index_cell] == 0) return false;
        if(!checkValue(parseInt(arr[index_cell]), seq)) return false;
    }
    return true;
}

function checkDiag(start, end, step, arr, seq){
    let count = 0;
    //console.log("chechDiag");
    
     for(let d = start; d<end; d+=step){
            if(arr[d] == 0) return false;
            if(!checkValue(parseInt(arr[d]), seq)) return false;
            
        }
    return true;
}

function checkValue(value, seq){
    
    if( (seq%2 == 0 && value%2 != 0) || (seq%2 != 0 && value%2 == 0)){
        //console.log("[false] value: ", value, " seq: ", seq);
        return false;
    } 
    //console.log("[true] value: ", value, " seq: ", seq);
        return true;
}

