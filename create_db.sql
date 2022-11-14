DROP database myBookshop;
CREATE DATABASE myBookshop;
USE myBookshop;
CREATE TABLE books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2)unsigned, author VARCHAR(50) ,PRIMARY KEY(id));
INSERT INTO books (name, price, author)VALUES('database book', 40.25, 'Tim Buchalka'),('Node.js book', 25.00, 'Justin Timberlake'), ('Express book', 31.99, 'Vasja Pupkin') ;
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON myBookshop.* TO 'appuser'@'localhost';

CREATE TABLE users (id INT AUTO_INCREMENT, firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR (50), 
username VARCHAR(50), password VARCHAR(100), PRIMARY KEY(id));

-- ALTER TABLE users
-- CHANGE COLUMN password hashedPassword VARCHAR(100);