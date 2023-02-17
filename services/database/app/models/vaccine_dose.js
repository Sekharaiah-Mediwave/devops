module.exports = function modelRole(sequelize, types) {
  const vaccineDose = sequelize.define(
    'vaccine_dose',
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
      vaccination_type_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'vaccination_type',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      name: {
        type: types.STRING,
        defaultValue: null,
      },
      start: {
        type: types.INTEGER,
        defaultValue: null,
      },
      end: {
        type: types.INTEGER,
        defaultValue: null,
      },
    },
    {
      tableName: 'vaccine_dose',
    }
  );

  vaccineDose.associate = function (models) {
    vaccineDose.belongsTo(models.vaccination_type, {
      as: 'vaccinationType',
      targetKey: 'uuid',
      foreignKey: 'vaccination_type_id',
    });
    

  };

  return vaccineDose;
};
