module.exports = function modelRole(sequelize, types) {
  const CronJobs = sequelize.define(
    'cron_jobs',
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
        type: types.STRING(1000),
        allowNull: false,
      },
      mailApiRoute: {
        type: types.STRING(1000),
        allowNull: false,
      },
      cronInitialValues: {
        type: types.JSON,
        allowNull: true,
        defaultValue: {},
      },
      cronScheduleTime: {
        type: types.STRING(1000),
        allowNull: false,
      },
      status: {
        type: types.STRING(50),
        allowNull: false,
        defaultValue: 'Active',
      },
    },
    {
      tableName: 'cron_jobs',
      defaultScope: { where: { status: 'Active' } },
    }
  );

  CronJobs.afterCreate(async (cronData) => {
    try {
      console.log('\n create cronData...', cronData);
    } catch (error) {
      console.log('\n cron after create error...', error);
    }
  });
  CronJobs.addHook('afterUpdate', async (cronData) => {
    try {
      console.log('\n update cronData...', cronData);
    } catch (error) {
      console.log('\n update cron error...', error);
    }
  });
  CronJobs.addHook('beforeDestroy', async (cronData) => {
    try {
      console.log('\n delete cronData...', cronData);
    } catch (error) {
      console.log('\n delete cron error...', error);
    }
  });

  return CronJobs;
};
