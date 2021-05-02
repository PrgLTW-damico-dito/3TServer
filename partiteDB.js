const pool = require('./managerDB.js');
const util = require('./util.js');

exports.getPartite = (req, res) => {
     pool.query('SELECT * FROM partita WHERE risultato = $1', [0],
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

    pool.query('SELECT * FROM partita WHERE id = $1', [id],
                (error, results) => {
                    if(error){
                        res.status(400).send(util.parseMsg(error.message));
                    }
                    else if(results.rowCount === 0){
                        res.status(401).send(util.parseMsg("Partita non trovata"));
                    }
                    else{
                        res.status(200).json(results.rows[0]);
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
    pool.query(`SELECT *
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
        pool.query(`INSERT INTO partita (idX, idO) VALUES ($1, $2)
                    RETURNING id, idX, idO, mossa, risultato, dataOra`, [id1, id2],
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
            });
            res.status(200).json(results.rows[0]);
            
        
        });
        
    });

}


function changeStato(id1, id2, res) {
    
}



exports.putMove = (req, res) => {
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
                res.status(200).json(results.rows[0]);
                if(risultato == 1){
                    changeScore(results.rows[0].idx, results.rows[0].ido, res);
                }
                else if (risultato == 2){
                    changeScore(results.rows[0].ido, results.rows[0].idx, res)

                }
                else if (risultato == 3){
                    pool.query(`UPDATE utente SET patte = patte +1, stato = 1  WHERE id = $1 or id = $2 `,
                        [results.rows[0].ido, results.rows[0].idx], (error) => {
                        if(error)
                        res.status(400).send(util.parseMsg(error.message));
                    });
                   
                }
            }
                
        });
    });
            
}
function changeScore(winner, loser, res){
    pool.query(`UPDATE utente SET  vinte = vinte+1, stato = 1 WHERE id = $1 `,
            [winner], (error) => {
        if(error)
        res.status(400).send(util.parseMsg(error.message));
        });
    pool.query(`UPDATE utente SET  perse = perse+1, stato = 1 WHERE id = $1 `,
            [loser],(error) => {
        if(error)
        res.status(400).send(util.parseMsg(error.message));
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
    let col = mossa%3;

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
    
    console.log("chechRow");
    let count = 0;
    
    for(let c=0; c<3; c++){
        let index_cell=(r+c)+(r*2);
        if(arr[index_cell] == 0) return false;
        count += parseInt(arr[index_cell]);
    }
    console.log(count);
    if (!checkCount(count, seq)) return false;
    return true;
}

function checkCol(c, arr, seq){
    let count = 0;
    console.log("chechCol");
    for(let r=0; r<3; r++){
        let index_cell=(r+c)+(r*2)
        if(arr[index_cell] == 0) return false;
        count += parseInt(arr[index_cell]);
    }

    if (!checkCount(count, seq)) return false;
    return true;
}

function checkDiag(start, end, step, arr, seq){
    let count = 0;
    console.log("chechDiag");
    
     for(let d = start; d<end; d+=step){
            if(arr[d] == 0) return false;
            count += parseInt(arr[d]);;
            
        }
    if (!checkCount(count, seq)) return false;
    return true;
}

function checkCount(count, seq){
    
    if(seq%2 == 0 && count%2 != 0) return false;
    if(seq%2 != 0 && count%2 == 0) return false;
    return true;
}