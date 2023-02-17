module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contact_information', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      fhirId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      nextOfKin: {
        type: Sequelize.JSONB,
      },
      powerOfAttorney: {
        type: Sequelize.JSONB,
      },
      gp: {
        type: Sequelize.JSONB,
      },
      clinicians: {
        type: Sequelize.JSONB,
      },
      socialWorkers: {
        type: Sequelize.JSONB,
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
    await queryInterface.dropTable('contact_information');
  },
};
