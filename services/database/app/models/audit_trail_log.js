// goals with reminders

module.exports = function modelGoal(sequelize, types) {
  const AuditTrailLogs = sequelize.define(
    'audit_trail_logs',
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
      user_id: {
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
      data_owner: {
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
      request_id: {
        type: types.TEXT,
      },
      action: {
        type: types.STRING(256), // add, update, delete, view, login, logout
      },
      action_text: {
        type: types.TEXT,
      },
      module_name: {
        type: types.STRING(1000),
      },
      action_date: {
        type: types.DATE,
        allowNull: false,
        defaultValue: types.NOW,
      },
    },
    {
      tableName: 'audit_trail_logs',
    }
  );

  AuditTrailLogs.associate = function (models) {
    AuditTrailLogs.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'user_info',
      targetKey: 'uuid',
    });
    AuditTrailLogs.belongsTo(models.user, {
      foreignKey: 'data_owner',
      as: 'data_owner_info',
      targetKey: 'uuid',
    });
  };

  return AuditTrailLogs;
};
