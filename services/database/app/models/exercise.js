module.exports = function modelLifeStyle(sequelize, types) {
  const Exercise = sequelize.define(
    'exercise',
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
      exerciseName: {
        type: types.STRING,
      },
      exerciseRepeat: {
        type: types.STRING,
      },
      exerciseFrequency: {
        type: types.INTEGER,
      },
      exerciseDuration: {
        type: types.INTEGER,
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
      tableName: 'exercise',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Exercise.associate = function (models) {
    Exercise.belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'userInfo',
      targetKey: 'uuid',
    });
  };
  return Exercise;
};
