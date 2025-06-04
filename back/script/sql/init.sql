CREATE TABLE T_user (
	id VARCHAR(255) PRIMARY KEY NOT NULL,
    mail VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE T_Articles (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    author VARCHAR(255),
    title VARCHAR(255),
    content VARCHAR(255),
    publicationdate DATE,
    CONSTRAINT fk_author FOREIGN KEY (author) REFERENCES T_user(id)
);

SELECT 'Script exécuté avec succès' AS info;
