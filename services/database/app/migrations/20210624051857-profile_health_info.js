module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('health_information', {
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
      primaryDiagnosis: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      secondaryDiagnosis: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      allergies: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      immunisations: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      bloodType: {
        type: Sequelize.STRING,
      },
      familyHistory: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      height: {
        /** LIFESTYLE INFLUENCES START */ type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      weight: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      religion: {
        type: Sequelize.STRING,
      },
      dietaryPreference: {
        type: Sequelize.STRING,
      },
      socialCareNeeds: {
        type: Sequelize.STRING,
      } /** END */,
      organDonation: {
        /** FUTURE CARE START */ type: Sequelize.STRING,
      },
      advanceCarePlanningDocument: {
        // URL
        type: Sequelize.STRING,
      },
      powerOfAttorney: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      iHaveAssignedSomeone: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      } /** END */,
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
    await queryInterface.dropTable('health_information');
  },
};
