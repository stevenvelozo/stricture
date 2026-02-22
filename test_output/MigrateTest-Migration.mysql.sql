-- Data Model -- Generated 2026-02-18T18:34:51.231Z

-- This script creates migration stubs for the following tables:
-- Table ----------------------------------------- Column Count ----------------
--   User                                                    6
--   Contact                                                 4
--   Address                                                 8



--   [ User ]
INSERT INTO
  DB_TO.User
    (
        -- INT UNSIGNED NOT NULL AUTO_INCREMENT
        IDUser,
        -- CHAR(64) NOT NULL DEFAULT ''
        UserName,
        -- CHAR(42) NOT NULL DEFAULT ''
        PasswordHash,
        -- CHAR(38) NOT NULL DEFAULT ''
        FirstName,
        -- CHAR(38) NOT NULL DEFAULT ''
        LastName,
        -- CHAR(60) NOT NULL DEFAULT ''
        Email
    )
SELECT
        -- {IDUser} INT UNSIGNED NOT NULL AUTO_INCREMENT
        TABLE_FROM.IDUser,
        -- {UserName} CHAR(64) NOT NULL DEFAULT ''
        TABLE_FROM.UserName,
        -- {PasswordHash} CHAR(42) NOT NULL DEFAULT ''
        TABLE_FROM.PasswordHash,
        -- {FirstName} CHAR(38) NOT NULL DEFAULT ''
        TABLE_FROM.FirstName,
        -- {LastName} CHAR(38) NOT NULL DEFAULT ''
        TABLE_FROM.LastName,
        -- {Email} CHAR(60) NOT NULL DEFAULT ''
        TABLE_FROM.Email
FROM
    DB_FROM.TABLE_FROM;



--   [ Contact ]
INSERT INTO
  DB_TO.Contact
    (
        -- INT UNSIGNED NOT NULL AUTO_INCREMENT
        IDContact,
        -- INT NOT NULL DEFAULT '0'
        CreatingIDUser,
        -- CHAR(90) NOT NULL DEFAULT ''
        Name,
        -- CHAR(60) NOT NULL DEFAULT ''
        Email
    )
SELECT
        -- {IDContact} INT UNSIGNED NOT NULL AUTO_INCREMENT
        TABLE_FROM.IDContact,
        -- {CreatingIDUser} INT NOT NULL DEFAULT '0'
        TABLE_FROM.CreatingIDUser,
        -- {Name} CHAR(90) NOT NULL DEFAULT ''
        TABLE_FROM.Name,
        -- {Email} CHAR(60) NOT NULL DEFAULT ''
        TABLE_FROM.Email
FROM
    DB_FROM.TABLE_FROM;



--   [ Address ]
INSERT INTO
  DB_TO.Address
    (
        -- INT UNSIGNED NOT NULL AUTO_INCREMENT
        IDAddress,
        -- INT NOT NULL DEFAULT '0'
        CreatingIDUser,
        -- INT NOT NULL DEFAULT '0'
        IDContact,
        -- CHAR(130) NOT NULL DEFAULT ''
        Address,
        -- CHAR(48) NOT NULL DEFAULT ''
        City,
        -- CHAR(24) NOT NULL DEFAULT ''
        State,
        -- CHAR(10) NOT NULL DEFAULT ''
        Zip,
        -- CHAR(12) NOT NULL DEFAULT ''
        Phone
    )
SELECT
        -- {IDAddress} INT UNSIGNED NOT NULL AUTO_INCREMENT
        TABLE_FROM.IDAddress,
        -- {CreatingIDUser} INT NOT NULL DEFAULT '0'
        TABLE_FROM.CreatingIDUser,
        -- {IDContact} INT NOT NULL DEFAULT '0'
        TABLE_FROM.IDContact,
        -- {Address} CHAR(130) NOT NULL DEFAULT ''
        TABLE_FROM.Address,
        -- {City} CHAR(48) NOT NULL DEFAULT ''
        TABLE_FROM.City,
        -- {State} CHAR(24) NOT NULL DEFAULT ''
        TABLE_FROM.State,
        -- {Zip} CHAR(10) NOT NULL DEFAULT ''
        TABLE_FROM.Zip,
        -- {Phone} CHAR(12) NOT NULL DEFAULT ''
        TABLE_FROM.Phone
FROM
    DB_FROM.TABLE_FROM;
