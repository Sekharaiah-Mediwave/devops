module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dietary_measurement', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
        type: Sequelize.UUID,
        refrences: {
          model: 'users',
          key: 'uuid',
        },
      },
      fhirId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dietaryNeed: {
        type: Sequelize.STRING,
      },
      chest: {
        type: Sequelize.FLOAT,
      },
      waist: {
        type: Sequelize.FLOAT,
      },
      hips: {
        type: Sequelize.FLOAT,
      },
      upperLeg: {
        type: Sequelize.FLOAT,
      },
      upperArm: {
        type: Sequelize.FLOAT,
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('dietary_measurement');
  },
};
