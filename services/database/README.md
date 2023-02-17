## DB migrations

Need **sequelize-cli**

- To generate the new migration file

First go inside app directory

> cd app

Then execute whatever command you need

`npx sequelize-cli migration:generate --name <module_name>`

- To upgrade the db

  `npx sequelize-cli db:migrate`

- To upgrade specific migration

  `npx sequelize-cli db:migrate --from <file name> --to <file name>`

- To upgrade n number of migrations

  `npx sequelize-cli db:migrate --to <file name>`

- To downgrade the db

  `npx sequelize-cli db:migrate:undo`

- To downgrade the specific db

  `npx sequelize-cli db:migrate:undo --name <file name>`

## DB seeders

- To generate the new seeders file

  `npx sequelize-cli seed:generate --name <module_name>`

- To upgrade the seeders

  `npx sequelize-cli db:seed:all`

- To downgrade the seeders

  `npx sequelize-cli db:seed:undo:all`

- To upgrade specify seed

  `npx sequelize-cli db:seed --seed <file name>`

- To downgrade the specific seed

  `npx sequelize-cli db:seed:undo  <file name>`

for more info visit [Documentation](http://docs.sequelizejs.com/manual/tutorial/migrations.html)

## Installation

`npm install`

## Data Sync

- To create database with required data

  `node app/sync.js`

## Start

`npm start`
