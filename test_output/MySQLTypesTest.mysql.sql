-- Data Model -- Generated 2026-02-18T18:34:51.214Z

-- This script creates the following tables:
-- Table ----------------------------------------- Column Count ----------------
--   User                                                    6
--   Address                                                10
--   Contact                                                 2



--   [ User ]
CREATE TABLE IF NOT EXISTS
    User
    (
        IDUser INT UNSIGNED NOT NULL AUTO_INCREMENT,
        UserName CHAR(64) NOT NULL DEFAULT '',
        PasswordHash CHAR(42) NOT NULL DEFAULT '',
        FirstName CHAR(38) NOT NULL DEFAULT '',
        LastName CHAR(38) NOT NULL DEFAULT '',
        Email CHAR(60) NOT NULL DEFAULT '',

        PRIMARY KEY (IDUser)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



--   [ Address ]
CREATE TABLE IF NOT EXISTS
    Address
    (
        IDAddress INT UNSIGNED NOT NULL AUTO_INCREMENT,
        CreatingIDUser INT NOT NULL DEFAULT '0',
        Created DATETIME,
        Name CHAR(90) NOT NULL DEFAULT '',
        Email CHAR(60) NOT NULL DEFAULT '',
        Address CHAR(130) NOT NULL DEFAULT '',
        City CHAR(48) NOT NULL DEFAULT '',
        State CHAR(24) NOT NULL DEFAULT '',
        Zip CHAR(10) NOT NULL DEFAULT '',
        Phone CHAR(12) NOT NULL DEFAULT '',

        PRIMARY KEY (IDAddress)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



--   [ Contact ]
CREATE TABLE IF NOT EXISTS
    Contact
    (
        IDContact INT UNSIGNED NOT NULL AUTO_INCREMENT,
        Name CHAR(64) NOT NULL DEFAULT '',

        PRIMARY KEY (IDContact)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
