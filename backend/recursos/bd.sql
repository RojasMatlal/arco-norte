DROP DATABASE IF EXISTS arconorte;
CREATE DATABASE IF NOT EXISTS arconorte DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON arconorte.* TO 'user'@'localhost' IDENTIFIED BY 'password';


USE arconorte;

CREATE TABLE roles (
	id_rol INT(3) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	nombre_rol VARCHAR(30) NOT NULL
)ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO roles (id_rol, nombre_rol) VALUES
	(745, 'Administrador'),
	(125, 'Operador');
	

CREATE TABLE usuarios (
	id_usuario INT(3) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	estatus_usuario TINYINT(1) NULL  DEFAULT -1 COMMENT '-1: Deshabilitado, 1: Habilitado',
	nombre_usuario VARCHAR(30) NOT NULL,
	ap_usuario VARCHAR(30) NOT NULL,
	am_usuario VARCHAR(30) NULL DEFAULT NULL,
	sexo_usuario TINYINT(1) NOT NULL COMMENT '1: Femenino, 2: Masculino',
	email_usuario VARCHAR(50) NOT NULL,
	password_usuario VARCHAR(64) NOT NULL,
	imagen_usuario VARCHAR(100) NULL DEFAULT NULL COMMENT 'profile.png',
	id_rol INT(3) NOT NULL,
	area_usuario VARCHAR(50) NOT NULL,
	FOREIGN KEY (id_rol) REFERENCES roles (id_rol) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO usuarios (id_usuario, nombre_usuario, ap_usuario, sexo_usuario, email_usuario, password_usuario, id_rol, area_usuario) VALUES
	(NULL, 'Evelin', 'Rojas', 1, 'evelin@gmail.com', SHA2('evelin123',256), 745, 'Administracion'),
	(NULL, 'Alejandro', 'Sainz', 2, 'ale@gmail.com', SHA2('ale123',256), 125, 'Operaciones');