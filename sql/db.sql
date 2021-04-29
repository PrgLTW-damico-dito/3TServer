drop table  utente;

create table utente(
	id SERIAL primary key,
	username varchar(15) unique NOT NULL,
	password varchar(8) NOT NULL,
	stato int DEFAULT 0 CHECK (stato = 1 OR stato = 0 OR stato = 2)
);



select * from utente