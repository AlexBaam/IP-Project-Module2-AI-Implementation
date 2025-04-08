CREATE DATABASE ocr_db;
\l
\c ocr_db


CREATE TABLE IF NOT EXISTS Users (
                                     user_id VARCHAR(10) PRIMARY KEY,
                                     name VARCHAR(100)
);

CREATE TABLE Categories (
                            category_id VARCHAR PRIMARY KEY,
                            name VARCHAR NOT NULL,
                            parent_id VARCHAR,
                            FOREIGN KEY (parent_id) REFERENCES Categories(category_id)
);

CREATE TABLE IF NOT EXISTS Merchants (
                                         merchant_id VARCHAR(10) PRIMARY KEY,
                                         name VARCHAR(100) UNIQUE,
                                         default_category_id VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS Transactions (
                                            transaction_id VARCHAR(10) PRIMARY KEY,
                                            date DATE NOT NULL,
                                            amount NUMERIC(10, 2) NOT NULL,
                                            merchant_id VARCHAR(10) REFERENCES Merchants(merchant_id),
                                            user_id VARCHAR(10) REFERENCES Users(user_id)
);

INSERT INTO Users (user_id, name)
VALUES ('U1', 'Test User')
ON CONFLICT (user_id) DO NOTHING;

