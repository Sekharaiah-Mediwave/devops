module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_profile', {
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
      centreId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'centre',
          },
          key: 'uuid',
        },
        onDelete: 'CASCADE',
      },
      specialism: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      department: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      qualification: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      team: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      jobRole: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      nameCalled: {
        type: Sequelize.STRING,
      },
      expertise: {
        type: Sequelize.STRING(1000),
      },
      ethnicity: {
        type: Sequelize.STRING,
      },
      languagesSpoken: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      profilePic: {
        type: Sequelize.JSONB,
      },
      iNeedAnInterpreter: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hospitalNumber: {
        type: Sequelize.STRING,
      },
      access: {
        type: Sequelize.JSON,
      },
      type: {
        type: Sequelize.STRING,
      },
      createdBy: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      updatedBy: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'user',
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
    await queryInterface.dropTable('user_profile');
  },
};
