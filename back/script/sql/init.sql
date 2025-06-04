CREATE TABLE T_user (
	id VARCHAR(255) PRIMARY KEY NOT NULL,
    mail VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

SELECT 'Script exécuté avec succès' AS info;
