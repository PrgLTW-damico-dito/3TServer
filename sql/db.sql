drop table if exists utente;

create table utente(
	id SERIAL primary key,
	username varchar(15) unique NOT NULL,
	password varchar(8) NOT NULL,
	stato int DEFAULT 0 CHECK (stato = 1 OR stato = 0 OR stato = 2),
	perse integer DEFAULT 0,
	vinte integer DEFAULT 0,
	patte integer DEFAULT 0
);


drop table if exists partita;

create table partita(
	id SERIAL primary key,
	idX integer REFERENCES utente(id) ON DELETE CASCADE,
	idO integer REFERENCES utente(id) ON DELETE CASCADE,
	mossa char(9) DEFAULT '000000000',
	risultato integer DEFAULT 0,
	dataOra timestamp DEFAULT CURRENT_TIMESTAMP

)

SELECT * FROM utente
SELECT * FROM partita

UPDATE partita set mossa = '000000000', risultato=0 where id = 2