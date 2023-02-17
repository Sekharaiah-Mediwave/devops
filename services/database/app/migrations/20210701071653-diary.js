module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('diary', {
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
      entryDate: {
        type: Sequelize.DATE,
      },

      notes: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
      status: {
        type: Sequelize.STRING /* Active --- tracker active, Inactive --- tracker not active, Archived --- if tracker gets archived */,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: Sequelize.BOOLEAN /* Active --- tracker active, Inactive --- tracker not active, Archived --- if tracker gets archived */,
        defaultValue: false,
      },
      createdFrom: {
        type: Sequelize.STRING /* diary, smoke, sleep, alcohol, mood, pain, problem */,
        defaultValue: 'diary',
      },
      painId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'pain_condition_records',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      problemId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'problem_records',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      alcoholId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'alcohol',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      smokeId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'smoke',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      sleepId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'sleep',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      moodId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'mood',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('diary');
  },
};
