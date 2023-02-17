const dbService = require('../services/db-service');
const { uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const smoke = require('./smoke');
const alcohol = require('./alcohol');
const bmi = require('./bmi');
const responseMessages = require('../middleware/response-messages');

const { Op } = Sequelize;

module.exports = {
  async createDiagnoses(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        name: ctx.request.body.name,
        notes: ctx.request.body.notes,
        diagnosedDate: ctx.request.body.diagnosedDate,
        createdBy: ctx.request.body.userId || ctx.req.decoded.uuid,
      };

      const saveResp = await dbService.create('diagnoses', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1071] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n diagnoses  save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getDiagnosesRecordByUuid: async (ctx) => {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              uuid: ctx.request.params.uuid,
            },
            {
              status: { [Op.not]: ['Unarchive', 'Inactive'] },
            },
          ],
        },
        include: [
          {
            required: false,
            model: 'medication_records',
            as: 'medications',
            attributes: { exclude: ['userId'] },
            where: {
              status: { [Op.not]: ['Unarchive', 'Inactive'] },
            },
          },
        ],
        attributes: { exclude: ['userId'] },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      }

      const count = await dbService.findOne('diagnoses', findQuery);

      if (!count) {
        ctx.res.notFound({ msg: responseMessages[1086] });
        return;
      }

      ctx.res.ok({ result: count });
      return;
    } catch (error) {
      console.log('\n Diagnoses find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getAllDiagnosesRecord(ctx) {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: { [Op.not]: ['Archive', 'Inactive'] },
            },
          ],
        },
        include: [
          {
            required: false,
            model: 'medication_records',
            as: 'medications',
            where: {
              status: { [Op.not]: ['Archive', 'Inactive'] },
            },
            include: [
              {
                required: false,
                model: 'medication_notes',
                as: 'medicationInfo',
                where: {
                  status: 'Active',
                },
              },
            ],
            attributes: { exclude: ['userId', 'medicationId'] },
          },
        ],
        attributes: { exclude: ['userId'] },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      }

      const { count, rows } = await dbService.findAndCountAll('diagnoses', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1086] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n diagnoses find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async createMedication(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        createdBy: ctx.request.body.userId || ctx.req.decoded.uuid,
        name: ctx.request.body.name,
        // notes: ctx.request.body.notes,
        medicationDate: ctx.request.body.medicationDate,
        diagnosesId: ctx.request.body.diagnosesId,
        medicationType: ctx.request.body.medicationType,
        otherMedicationWay: ctx.request.body.otherMedicationWay,
        dosage: ctx.request.body.dosage,
        frequency: ctx.request.body.frequency,
        symptom: ctx.request.body.symptom,
      };
      const saveResp = await dbService.create('medication_records', savePayload, {});
      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1072] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n medication  save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateDiagnosesRecord(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        name: ctx.request.body.name,
        // notes: ctx.request.body.notes,
        diagnosedDate: ctx.request.body.diagnosedDate,
        updatedBy: ctx.request.body.userId || ctx.req.decoded.uuid,
      };

      const updateResp = await dbService.update('diagnoses', updatePayload, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1073] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n diagnoses update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateMedicationRecord(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        name: ctx.request.body.name,
        notes: ctx.request.body.notes,
        medicationDate: ctx.request.body.medicationDate,
        diagnosesId: ctx.request.body.diagnosesId,
        medicationType: ctx.request.body.medicationType,
        otherMedicationWay: ctx.request.body.otherMedicationWay,
        dosage: ctx.request.body.dosage,
        frequency: ctx.request.body.frequency,
        symptom: ctx.request.body.symptom,
        updatedBy: ctx.request.body.userId || ctx.req.decoded.uuid,
      };

      const updateResp = await dbService.update('medication_records', updatePayload, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1073] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n medication records update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async toggleDiagnosesArchived(ctx) {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
        archivedDate: ctx.request.body.status == 'Archive' ? new Date() : null,
      };
      const updateDiagnosesResp = await dbService.update('diagnoses', updatePayload, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!updateDiagnosesResp[1]) {
        ctx.res.forbidden({ msg: responseMessages[1073] });
        return;
      }
      const updateMedcationResp = await dbService.update('medication_records', updatePayload, {
        where: { diagnosesId: updateDiagnosesResp[1][0].uuid },
        individualHooks: true,
      });

      if (!updateMedcationResp) {
        ctx.res.forbidden({ msg: responseMessages[1074] });
        return;
      }

      ctx.res.ok({ result: { diagenoseResult: updateDiagnosesResp, medicationResult: updateMedcationResp } });
      return;
    } catch (error) {
      console.log('\n diagnoses update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async toggleMedicationArchived(ctx) {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
        archivedDate: ctx.request.body.status == 'Archive' ? new Date() : null,
      };

      const updateMedcationResp = await dbService.update('medication_records', updatePayload, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!updateMedcationResp) {
        ctx.res.forbidden({ msg: responseMessages[1074] });
        return;
      }

      ctx.res.ok({ result: updateMedcationResp });
      return;
    } catch (error) {
      console.log('\n diagnoses update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getAllArchivedDiagnoses(ctx) {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Archive',
            },
          ],
        },
        include: [
          {
            required: false,
            model: 'medication_records',
            as: 'medications',
            // attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
          },
        ],
        // attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] }
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      const { count, rows } = await dbService.findAndCountAll('diagnoses', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1086] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n coping find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getAllArchivedMedication(ctx) {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Archive',
            },
          ],
        },
        include: [
          {
            // required: false,
            model: 'diagnoses',
            as: 'diagnosesInfo',
            attributes: ['name', 'notes', 'diagnosedDate'],
            where: {
              status: 'Active',
            },
          },
        ],
        // attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] }
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      const { count, rows } = await dbService.findAndCountAll('medication_records', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1087] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n Meidcation find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteDiagnoses(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };
      const daignosesIds = await dbService.findOne('diagnoses', {
        where: { uuid: ctx.request.query.uuid },
      });

      const updateResp = await dbService.update('diagnoses', updatePayload, {
        where: { uuid: ctx.request.query.uuid },
        individualHooks: true,
      });
      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1075] });
        return;
      }
      const updateMedicationResp = await dbService.update('medication_records', updatePayload, {
        where: { diagnosesId: daignosesIds.uuid },
      });
      ctx.res.ok({ result: updateMedicationResp });
      return;
    } catch (error) {
      console.log('\n medication delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteMedication(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update('medication_records', updatePayload, {
        where: { uuid: ctx.request.query.uuid },
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1075] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n Mediacation delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  async createMedicationNotes(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        medicationId: ctx.request.body.medicationId,
        notes: ctx.request.body.notes,
        createdBy: ctx.request.body.userId || ctx.req.decoded.uuid,
      };

      const saveResp = await dbService.create('medication_notes', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1076] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n medication notes  save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateMedicationNotes(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        notes: ctx.request.body.notes,
        updatedBy: ctx.request.body.userId || ctx.req.decoded.uuid,
      };

      const updateResp = await dbService.update('medication_notes', updatePayload, {
        where: {
          uuid: ctx.request.body.uuid,
        },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1077] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n medication records update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteMedicationNotes(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update('medication_notes', updatePayload, {
        where: { uuid: ctx.request.query.uuid },
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1078] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n Mediacation notes delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  /* Activity Section */
  async createActivity(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        activityName: ctx.request.body.activityName,
        discription: ctx.request.body.discription,
      };
      const saveResp = await dbService.create('life_style', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1079] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n LifeStyle  save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getActivites(ctx) {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: { [Op.not]: ['Archive', 'Inactive'] },
            },
          ],
        },
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      }

      const { count, rows } = await dbService.findAndCountAll('life_style', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1088] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n lifeStyle find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async toggleActivityArchived(ctx) {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };
      const saveResp = await dbService.update('life_style', updatePayload, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1080] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n LifeStyle update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getAllArchivedActivity(ctx) {
    try {
      const findQuery = {
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Archive',
            },
          ],
        },

        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      const { count, rows } = await dbService.findAndCountAll('life_style', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1088] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n LifeStyle find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteActivity(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const saveResp = await dbService.update('life_style', updatePayload, {
        where: { uuid: ctx.request.query.uuid },
      });
      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1081] });
        return;
      }
      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n LifeStyle delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateActivity(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        activityName: ctx.request.body.activityName,
        discription: ctx.request.body.discription,
      };

      const updateResp = await dbService.update('life_style', updatePayload, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1082] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n life_style records update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  /* Exercies and  */
  async getTrackerInfo(ctx) {
    try {
      const userID = ctx.request.query.userId ? ctx.request.query.userId : ctx.req.decoded.uuid;
      const smokeValue = await smoke.getLastSmokeInfo(userID);
      const alcoholValue = await alcohol.getLastAlcoholInfo(userID);
      const bmiValue = await bmi.getLastBmiInfo(userID);
      ctx.res.ok({
        result: {
          smoke: smokeValue.rows[0],
          alcohol: {
            result: alcoholValue.rows[0],
            totalUnits: alcoholValue.totalUnits,
          },
          bmi: bmiValue.rows[0],
        },
      });
      return;
    } catch (error) {
      console.log('\n lifeStyle find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  async createExercise(ctx) {
    try {
      for (let i = 0; i < ctx.request.body.length; i++) {
        ctx.request.body[i].userId = ctx.req.decoded.uuid;
      }
      const saveResp = await dbService.bulkCreate('exercise', ctx.request.body, { individualHooks: true });

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1083] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n exercise save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getExercise(ctx) {
    try {
      const findQuery = {
        where: {
          userId: ctx.request.query.userId || ctx.req.decoded.uuid,
          status: 'Active',
        },
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      };

      const { count, rows } = await dbService.findAndCountAll('exercise', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1089] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n exercise_dietary find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async upsertDietaryAndMeasurement(ctx) {
    try {
      const getResp = await dbService.findOne('dietary_measurement', {
        where: {
          userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        },
      });
      let saveResp;
      if (!getResp) {
        ctx.request.body.userId = ctx.request.body.userId || ctx.req.decoded.uuid;
        saveResp = await dbService.create('dietary_measurement', ctx.request.body, { individualHooks: true });
        if (!saveResp) {
          ctx.res.forbidden({ msg: responseMessages[1084] });
          return;
        }
      } else {
        let payload = null;
        if (ctx.request.body.dietaryNeed) {
          payload = {
            dietaryNeed: ctx.request.body.dietaryNeed,
          };
        }
        saveResp = await dbService.update('dietary_measurement', payload || ctx.request.body, {
          where: {
            userId: ctx.request.body.userId || ctx.req.decoded.uuid,
            // individualHooks: true,
          },
        });
        if (!saveResp) {
          ctx.res.forbidden({ msg: responseMessages[1084] });
          return;
        }
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n dietary_measurement  save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateExercise(ctx) {
    try {
      console.log('-------------ctx.request.body--------------->', ctx.request.body);
      // ctx.request.body.userId =  ctx.req.decoded.uuid;
      const saveResp = await dbService.update('exercise', ctx.request.body, {
        where: { uuid: ctx.request.body.uuid },
        individualHooks: true,
      });

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1083] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n exercise  save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getDiertaryAndMesurement(ctx) {
    try {
      const findQuery = {
        where: {
          userId: ctx.request.query.userId || ctx.req.decoded.uuid,
        },
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      };

      const { count, rows } = await dbService.findAndCountAll('dietary_measurement', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1085] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n dietary_measurement find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteExercise(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const saveResp = await dbService.update('exercise', updatePayload, {
        where: { uuid: ctx.request.query.uuid },
      });
      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1070] });
        return;
      }
      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n exercise delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
