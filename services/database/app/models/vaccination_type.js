module.exports = function modelRole(sequelize, types) {
  const vaccinationType = sequelize.define(
    'vaccination_type',
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
      name: {
        type: types.STRING,
        defaultValue: null,
      },
      description: {
        type: types.STRING,
        defaultValue: null,
      },
      q_id: {
        type: types.UUID,
        defaultValue: null,
      },
      start_date: {
        type: types.DATE,
        defaultValue: null,
      },
      end_date: {
        type: types.DATE,
        defaultValue: null,
      },
      duration: {
        type: types.INTEGER,
        defaultValue: null,
      },
      start_time: {
        type: types.DATE,
        defaultValue: null,
      },
      end_time: {
        type: types.DATE,
        defaultValue: null,
      },
      created_by: {
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
      status: {
        type: types.STRING,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'vaccination_type',
    }
  );

  vaccinationType.associate = function (models) {
    vaccinationType.belongsTo(models.user, {
      as: 'userInfo',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    vaccinationType.hasMany(models.vaccine_dose, {
      as: 'vaccineDose',
      foreignKey: 'vaccination_type_id',
      sourceKey: 'uuid',
    });
    vaccinationType.hasMany(models.assign_vaccine_type, {
      as: 'Clinicians',
      foreignKey: 'vaccination_type_id',
      sourceKey: 'uuid',
    });
  };

  return vaccinationType;
};
