module.exports = function modelRole(sequelize, types) {
  const Temperature = sequelize.define(
    'temperature',
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

      date: {
        type: types.DATE,
        // defaultValue: Sequelize.NOW,
      },
      bodyTemperature: {
        type: types.FLOAT,
      },
      status: {
        type: types.STRING,
        defaultValue: 'Active',
      },
      fhirSynced: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'temperature',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Temperature.addHook('beforeUpdate', (temperatureRecord) => {
    try {
      temperatureRecord.fhirSynced = false;
    } catch (error) {
      console.log('\n update temperature hook error...', error);
    }
  });

  Temperature.associate = function (models) {
    Temperature.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return Temperature;
};
