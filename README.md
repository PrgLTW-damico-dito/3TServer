<img width="12%" src="img/logo.jpeg" align="right">

>*Linguaggi e tecnologie per il web (Prof: Riccardo Rosati)<br/>
>D'Amico Martina, Dito Andrea*

<h1>Documentazione progetto</h1>

## Specifiche

Si vuole realizzare un'applicazione che consenta a due o più utenti di giocare al gioco del tic tac toe (tris). Di ogni utente è necessario conoscere l'username, la sua password.

L'utente una volta registrato può giocare una partita selezionando uno degli utenti online, i quali possono essere: *online*, *offline* oppure *in partita*, solo ai giocatori online è possibile inviare una proposta di sfida.

Di ogni partita interessa sapere se la partite è in corso, iniziata o terminata, chi gioca con X e chi con O, in particolare l'applicazione sceglierà randomicamente il simbolo.
Il giocatore a cui è stato assegnato X fa la prima mossa.

Nella schermata di gioco viene registrato il punteggio dei due giocatori.

Se la partita è:
 * **in corso** interessa sapere a chi tocca la mossa successiva e registrare le mosse con il relativo ordine.
 * **terminata** interessa sapere il risultato della partita (1: vince X, 2: vince O, 3: patta).

Del giocatore interessa sapere il numero di partite: *perse*, *vinte* e *pareggiate*

Una volta terminata la partita l'utente può:

 * tornare nella schemata precedente e scegliere un nuovo avversario
 * fare logout e uscire dall'applicazione



## Lato server (back-end)
Il server è accessibile dall'indirizzo remoto:
`https://server3t.herokuapp.com`

Tutte le informazioni trasmesse e restituite dal server vengono trasmesse in formato json.

## Dizionario degli oggetti
### Classe utente
|proprietà|tipo|descrizione|
|-----|-------|------|
|stato| intero  |1: online<br>0: offline<br>2: in paritita|
|username| stringa | nome scelto dall'utente|
|password| stringa ||
|perse| intero | numero delle partite perse|
|vinte| intero | numero delle partite vinte|
|patte| intero | numero delle partite patte|

### Classe Partita
|proprietà|tipo|descrizione|
|-----|-------|------|
|id|intero|identificativo della partita|
|idX|intero|identificativo del giocatore X|
|idO|intero|identificativo del giocatore con O|
|mossa|stringa|stringa di 9 caratteri|
|risultato|intero|risultato della partita<br>0: partita iniziata o in corso<br>1:vince X<br>2: vince O<br>3: patta|
|dataOra|timestamp|data e ora della partita|



## REST server endpoints
### Utenti

|Url|metodo|descrizione|
|---|------|-----------|
|`utenti`|`get`|restituisce un vettore di tutti gli utenti iscritti|
|`utenti/{id}`|`get`|restituisce informazioni sull'utente|
|`utenti`|`post`|aggiunge un nuovo utente e restituisce l'oggetto json dell'utente<br>Parametri richiesti: username e password|
|`utenti`|`put`|modifica attributi dell'utente e restituisce l'oggetto json dell'utente<br>Attributi modificabili: password|
|`utenti/login`|`put`|effettua il Login e passa nello stato online e restituisce l'oggetto json dell'utente <br>Parametri richiesti: username e password|
|`utenti/logout`|`put`|effettua il Logout e passa nello stato offline <br>Parametri richiesti: username e password|
|`utenti`|`delete`|rimuove utente<br>Parametri richiesti: username e password|




### Partita 
|Url|metodo|descrizione|
|---|------|-----------|
|`partite`|`get`|restituisce un vettore delle partite in corso|
|`partite/{id}`|`get`|restituisce dettagli sulla partita identificata dal suo id|
|`partite`|`post`|crea una nuova partita<br>Parametri richiesti: id degli utenti che giocano, id1 e id2.<br>Utente con id1 è sempre quello che lancia la sfida, quindi chi sfida giochera con la X|
|`partite`|`put`|indica la mossa appena effettuata<br>Parametri richiesti: id_partita e numero della casella.<br>Quindi oggetto json di questo tipo { "id": ..., "mossa": ...}<br>I numeri delle caselle del tris vengono numerati da 0 a 8 partendo dalla casella in alto a sinistra|
|`partite/chat`|`put`|data: { id: <id_partita>, id_player: <id_user>, msg: <messaggio> }|


