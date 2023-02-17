module.exports = function modelLifeStyle(sequelize, types) {
  const DietaryMeasurement = sequelize.define(
    'dietary_measurement',
    {
      id: {
        type: types.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      userId: {
        type: types.INTEGER,
        refrences: {
          model: 'users',
          key: 'id',
        },
      },
      fhirId: {
        type: types.INTEGER,
        allowNull: true,
      },
      dietaryNeed: {
        type: types.STRING,
      },
      chest: {
        type: types.FLOAT,
      },
      waist: {
        type: types.FLOAT,
      },
      hips: {
        type: types.FLOAT,
      },
      upperLeg: {
        type: types.FLOAT,
      },
      upperArm: {
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
      createdAt: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      updatedAt: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
    },
    {
      tableName: 'dietary_measurement',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  DietaryMeasurement.associate = function (models) {
    DietaryMeasurement.belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'userInfo',
      targetKey: 'uuid',
    });
  };
  return DietaryMeasurement;
};
