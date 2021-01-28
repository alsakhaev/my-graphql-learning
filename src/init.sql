DROP TABLE posts;
DROP TABLE conferences;
DROP TABLE users;
DROP TABLE invitations;
DROP TABLE attendance;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE posts (
  id VARCHAR(31) PRIMARY KEY,
  namespace varchar(15) NOT NULL,
  username VARCHAR(255) NOT NULL,
  text TEXT NOT NULL
);

CREATE TABLE conferences (
  id SERIAL PRIMARY KEY,
  short_name VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  date_from DATE NULL,
  date_to DATE NULL
);

CREATE TABLE users (
  namespace varchar(15) NOT NULL,
  username varchar(50) NOT NULL,
  fullname varchar(255) NOT NULL,
  img varchar(255) NOT NULL,
  main_conference_id INTEGER NULL,
  PRIMARY KEY(namespace, username)
);

CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  namespace_from varchar(15) NOT NULL,
  namespace_to varchar(15) NOT NULL,
  username_from varchar(50) NOT NULL,
  username_to varchar(50) NOT NULL,
  conference_id INTEGER NOT NULL,
  post_id varchar(31) NOT NULL,
  is_private bit NOT NULL,
  created TIMESTAMPTZ NOT NULL,
  modified TIMESTAMPTZ NOT NULL
);

CREATE TABLE attendance (
  conference_id INTEGER NOT NULL,
  namespace varchar(15) NOT NULL,
  username varchar(50) NOT NULL
);

CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4(),
  name VARCHAR,
  team_id UUID NULL,
  PRIMARY KEY (id)
);

CREATE TABLE itemtags (
  item_id VARCHAR NOT NULL,
  tag_id UUID NOT NULL,
  namespace VARCHAR NOT NULL,
  username VARCHAR NOT NULL,
  value BOOLEAN NOT NULL,
  created TIMESTAMPTZ NOT NULL,
  modified TIMESTAMPTZ NOT NULL
);

CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4(),
  name VARCHAR,
  PRIMARY KEY (id)
);

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon6', 'Devcon 6', 'Bogota, Colombia'||chr(10)||'https://archive.devcon.org', '2021-04-21T10:00:00Z', '2021-04-28T10:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon5', 'Devcon 5', 'Osaka, Japan'||chr(10)||'https://archive.devcon.org/devcon-5/details', '2019-10-08T10:00:00Z', '2019-10-11T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon4', 'Devcon 4', 'Prague, Czech Republic'||chr(10)||'https://archive.devcon.org/devcon-4/details', '2018-10-30T10:00:00Z', '2018-11-02T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon3', 'Devcon 3', 'Cancun, Mexico'||chr(10)||'https://archive.devcon.org/devcon-3/details', '2017-11-01T10:00:00Z', '2017-11-04T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon2', 'Devcon 2', 'Shanghai, China'||chr(10)||'https://archive.devcon.org/devcon-2/details', '2016-09-19T10:00:00Z', '2016-09-21T20:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon1', 'Devcon 1', 'London, United Kingdom'||chr(10)||'https://archive.devcon.org/devcon-1/details', '2015-11-09T10:00:00Z', '2015-11-13T10:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Devcon0', 'Devcon 0', 'Kreuzberg, Berlin'||chr(10)||'https://archive.devcon.org/devcon-0/details', '2014-11-24T10:00:00Z', '2014-11-28T10:00:00Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('MoneyDance', 'MoneyDance: Virtual Hackathon, Summit, and Demo Day with $37K in Prizes', '', '2020-09-27T21:00:00.000Z', '2020-12-08T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain Summit 2020', 'London, United Kingdom'||chr(10)||'https://www.blockchainsummitlondon.com/#', '2020-10-19T21:00:00.000Z', '2020-10-20T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain Life 2020', 'Moscow, Russia', '2020-10-20T21:00:00.000Z', '2020-10-21T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Future Blockchain Summit 2020', 'Dubai, United Arab Emirates', '2020-10-26T21:00:00.000Z', '2020-10-27T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain Expo Tokyo [Autumn]', 'Tokyo, Japan'||chr(10)||'https://www.bc-expo-at.jp/en-gb.html', '2020-10-27T21:00:00.000Z', '2020-10-29T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain World Forum Euro 2020', 'London, United Kingdom', '2020-10-28T21:00:00.000Z', '2020-10-29T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('WorldCrypt', 'World Crypto-Bitcoin, Blockchain & Cyber-Security', 'Paris, France', '2020-10-29T21:00:00.000Z', '2020-10-30T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Financial', 'The Financial Summit 2020', 'Bali, Indonesia', '2020-10-31T21:00:00.000Z', '2020-11-06T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Romania Blockchain Summit', 'Bucharest, Romania'||chr(10)||'https://www.romaniablockchainsummit.com/', '2020-11-01T21:00:00.000Z', '2020-11-02T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Korea Blockchain Week 2020', 'Seoul, Korea'||chr(10)||'https://koreablockchainweek.com', '2020-11-01T21:00:00.000Z', '2020-11-07T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain ', 'Blockchain Expo North America 2020', 'California, United States'||chr(10)||'https://blockchain-expo.com/northamerica/', '2020-11-03T21:00:00.000Z', '2020-11-04T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', '2nd International Conference on Big Data and Blockchain', 'Newcastle, United Kingdom'||chr(10)||'http://www.icobdb.org/', '2020-11-13T21:00:00.000Z', '2020-11-15T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('AIBC', 'AIBC Summit Malta 2020', 'Malta', '2020-11-16T21:00:00.000Z', '2020-11-18T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'UK Blockchain Conference 2020', 'Milton Keynes, United Kingdom'||chr(10)||'https://www.ukblockchainconference.com/', '2020-11-23T21:00:00.000Z', '2020-11-23T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain Expo Europe 2020', 'Amsterdam, Netherlands'||chr(10)||'https://blockchain-expo.com/europe/', '2020-11-23T21:00:00.000Z', '2020-11-24T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Paris Blockchain Week Summit 2020', 'Paris, France', '2020-12-08T21:00:00.000Z', '2020-12-09T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain World Forum China 2020', 'Shenzhen, China', '2020-12-09T21:00:00.000Z', '2020-12-10T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'European Blockchain Conference Barcelona 2021', 'Catalonia, Spain', '2021-01-24T21:00:00.000Z', '2021-01-25T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain Week Rome 2021', 'Rome, Italy', '2021-03-08T21:00:00.000Z', '2021-03-12T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('Blockchain', 'Blockchain Expo Global 2021', 'London, United Kingdom'||chr(10)||'https://blockchain-expo.com/global/', '2021-03-16T21:00:00.000Z', '2021-03-17T21:00:00.000Z');

INSERT INTO conferences (short_name, name, description, date_from, date_to) 
VALUES ('TOKEN2049', 'TOKEN2049', 'Hong Kong'||chr(10)||'https://www.token2049.com/', '2021-03-22T21:00:00.000Z', '2021-03-23T21:00:00.000Z');

INSERT INTO tags (name) 
VALUES ('Devcon6');