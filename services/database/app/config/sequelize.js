/* eslint-disable no-undef */
const { Sequelize, fs, path } = require('../services/imports');
const config = require('./config');

// connect to postgres db
const sequelize = new Sequelize(config.postgres.db, config.postgres.user, config.postgres.password, {
  dialect: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
});

const db = {
  Sequelize,
  sequelize,
  models: {},
  masterTables: {},
};

const modelsDir = path.normalize(`${__dirname}/../models`);

// loop through all files in models directory ignoring hidden files and this file
fs.readdirSync(modelsDir)
  .filter((file) => file.indexOf('.') !== 0 && file.indexOf('.map') === -1)
  // import model files and save model names
  .forEach((file) => {
    // console.info(`Loading model file ${file}`);
    const model = require(path.join(modelsDir, file))(db.sequelize, db.Sequelize.DataTypes);
    if (model && model.isMaster) {
      db.masterTables[model.name] = model;
    }
    db.models[model.name] = model;
  });

// calling all the associate function, in order to make the association between the models
Object.keys(db.models).forEach((modelName) => {
  if (db.models[modelName].associate) {
    db.models[modelName].associate(db.models);
  }
});

// Synchronizing any model changes with database.
// db.sequelize
//   .sync({
//     // force: true
//   })
//   .then(err => {
//     if (err) console.error("An error occured %j", err);
//     else console.info("Database synchronized");
//   });

db.sequelize.options.logging = (str) => {
  if (config.dbLog) {
    console.log('\n', str, '\n');
  }
};

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

process.on('SIGINT', () => {
  console.log('SIGINT: Closing postgres connection');
  db.sequelize.close();
  process.exit(0);
});

module.exports = db;
