module.exports = function modelRole(sequelize, types) {
  const contact_information = sequelize.define(
    'contact_information',
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
      nextOfKin: {
        type: types.JSONB,
      },
      powerOfAttorney: {
        type: types.JSONB,
      },
      gp: {
        type: types.JSONB,
      },
      clinicians: {
        type: types.JSONB,
      },
      socialWorkers: {
        type: types.JSONB,
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'contact_information',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  contact_information.addHook('beforeUpdate', (contact_informationRecord) => {
    try {
      contact_informationRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update contact information hook error...', error);
    }
  });

  contact_information.associate = function (models) {
    contact_information.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return contact_information;
};
