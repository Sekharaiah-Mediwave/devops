module.exports = function modelRole(sequelize, types) {
  const health_information = sequelize.define(
    'health_information',
    {
      id: {
        type: types.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
        type: types.UUID,
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
        type: types.INTEGER,
        allowNull: true,
      },
      primaryDiagnosis: {
        type: types.ARRAY(types.STRING),
      },
      secondaryDiagnosis: {
        type: types.ARRAY(types.STRING),
      },
      allergies: {
        type: types.ARRAY(types.STRING),
      },
      immunisations: {
        type: types.ARRAY(types.STRING),
      },
      bloodType: {
        type: types.STRING,
      },
      familyHistory: {
        type: types.ARRAY(types.STRING),
      },
      height: {
        /** LIFESTYLE INFLUENCES START */ type: types.FLOAT,
        defaultValue: 0.0,
      },
      weight: {
        type: types.FLOAT,
        defaultValue: 0.0,
      },
      religion: {
        type: types.STRING,
      },
      dietaryPreference: {
        type: types.STRING,
      },
      socialCareNeeds: {
        type: types.STRING,
      } /** END */,
      organDonation: {
        /** FUTURE CARE START */ type: types.STRING,
      },
      advanceCarePlanningDocument: {
        // URL
        type: types.STRING,
      },
      powerOfAttorney: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      iHaveAssignedSomeone: {
        type: types.BOOLEAN,
        defaultValue: false,
      } /** END */,
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'health_information',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  health_information.addHook('beforeUpdate', (health_informationRecord) => {
    try {
      health_informationRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update health information hook error...', error);
    }
  });

  health_information.associate = function (models) {
    health_information.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return health_information;
};
