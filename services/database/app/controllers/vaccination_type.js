const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

function removeDuplicates(dataValue) {
  return dataValue.filter((a, b) => dataValue.indexOf(a) === b);
}

module.exports = {
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        name: ctx.request.body?.name,
        description: ctx.request.body?.description,
        q_id: null,
        start_date: ctx.request.body?.start_date,
        end_date: ctx.request.body?.end_date,
        duration: ctx.request.body?.duration,
        start_time: ctx.request.body?.start_time,
        end_time: ctx.request.body?.end_time,
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body?.userId,
        status: ctx.request.body?.status,
      };

      const findResp = await dbService.findOne('vaccination_type', {
        where: {
          created_by: savePayload.created_by,
          name: savePayload.name
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1169] });
        return;
      }

      const saveResp = await dbService.create('vaccination_type', savePayload, {});

      const vaccineDose = ctx.request.body.vaccineDose?.map((item)=>{
        return { 
          uuid: uuidv4(),
          vaccination_type_id: savePayload.uuid,
          name: item.name,
          start: item.start,
          end: item.end,          
        }
      });
      if(vaccineDose && vaccineDose.length > 0)
      await dbService.bulkCreate('vaccine_dose', vaccineDose);
      if(ctx.request.body?.clinicians && ctx.request.body?.clinicians.length > 0){
        const clinicians = ctx.request.body?.clinicians?.map((item)=>{
          return { 
            uuid: uuidv4(),
            userId: item,
            vaccination_type_id: savePayload.uuid,
          }
        });
        console.log('clinicians', clinicians);
        await dbService.bulkCreate('assign_vaccine_type', clinicians);
      }
      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n group save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('vaccination_type', {
        where: { uuid: ctx.request.params.uuid },
        include: [
          {
            model: 'vaccine_dose',
            as: 'vaccineDose',
          },
          {
            model: 'assign_vaccine_type',
            as: 'Clinicians',
          },
        ],
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1170] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
      
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('vaccination_type', {
        where: { uuid: ctx.request.params.uuid },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1170] });
        return;
      }
      const deleteResp = await dbService.destroy('vaccination_type',{
        where: {
          uuid: ctx.request.params.uuid,
      }
    })
      ctx.res.ok({ result: deleteResp });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  assignQuestionnaire : async (ctx) => {
    try {
      await dbService.update('vaccination_type',{
        q_id: ctx.request.body?.questionnaire_id,
      }, 
      {
        where: { uuid: ctx.request.body.vaccine_type_id },
      });

      ctx.res.ok({ result: "success" });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const findRespEx = await dbService.findOne('vaccination_type', {
        where: {
          uuid: { [Op.not]:ctx.request.body.uuid },
          name: ctx.request.body.name
        },
      });

      if (findRespEx) {
        ctx.res.conflict({ msg: responseMessages[1169] });
        return;
      }
      const updatePayload = {
        name: ctx.request.body.name,
        description: ctx.request.body.description,
        q_id: ctx.request.body.q_id,
        start_date: ctx.request.body.start_date,
        end_date: ctx.request.body.end_date,
        duration: ctx.request.body.duration,
        start_time: ctx.request.body.start_time,
        end_time: ctx.request.body.end_time,
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'vaccination_type',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );
      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1171] });
        return;
      }
      const findResp = await dbService.findAll('vaccine_dose', {
        where: {
          vaccination_type_id: ctx.request.body.uuid,
        },
      });
      console.log(findResp);
      const updateVaccineDose = ctx.request.body.vaccineDose.filter((el) => findResp.some((f) => f?.uuid == el?.uuid))
      .map((teamName) => teamName);
      const removeVaccineDose = findResp
      .filter((el) => !ctx.request.body.vaccineDose.some((f) => f?.uuid == el.uuid))
      .map((teamName) => teamName.uuid);
      const newVaccineDose = ctx.request.body.vaccineDose
      .filter((el) => !findResp.some((f) => f.uuid == el?.uuid))
      .map((teamName) => teamName);
      console.log("removeVaccineDose",removeVaccineDose);
      console.log("newVaccineDose",newVaccineDose);
      const vaccineDose = newVaccineDose.map((item)=>{
        return { 
          uuid: uuidv4(),
          name: item.name,
          start: item.start,
          end: item.end,
          vaccination_type_id: ctx.request.body.uuid,          
        }
      });
      await updateVaccineDose.map(async(item)=>{         
        await dbService.update(
          'vaccine_dose',
          { 
            name: item.name,
            start: item.start,
            end: item.end,        
          },
          { where: { uuid: item.uuid }, individualHooks: true },
          {}
        );
      });
      await dbService.bulkCreate('vaccine_dose', vaccineDose);
      await dbService.destroy('vaccine_dose',{
        where: {
          uuid: {
            [Op.in]: removeVaccineDose
          },
          vaccination_type_id: ctx.request.body.uuid
        }
      });

      const findResp1 = await dbService.findAll('assign_vaccine_type', {
        where: {
          vaccination_type_id: ctx.request.body.uuid,
        },
      });
      console.log(findResp1);
      const removeClinicians = findResp1
      .filter((el) => !ctx.request.body.clinicians.some((f) => f == el.userId))
      .map((teamName) => teamName.uuid);
      const newClinicians = ctx.request.body.clinicians
      .filter((el) => !findResp1.some((f) => f.userId == el))
      .map((teamName) => teamName);
      console.log("removeClinicians",removeClinicians);
      console.log("newClinicians",newClinicians);
      const clinicians = newClinicians.map((item)=>{
        return { 
          uuid: uuidv4(),
          userId: item,
          vaccination_type_id: ctx.request.body.uuid,
          
        }
      });
      await dbService.bulkCreate('assign_vaccine_type', clinicians);
      await dbService.destroy('assign_vaccine_type',{
        where: {
          uuid: {
            [Op.in]: removeClinicians
          },
          vaccination_type_id: ctx.request.body.uuid
        }
      });
      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n group update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const { sortArr, offset, limit } = commonService.paginationSortFilters(ctx);
      let pagination = {
        offset,
        limit,
      };
      let where = {};
      if (ctx.request.query.search) {
        where = {
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('vaccination_type.name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        };
      }
      if (ctx.request.query.status) {
        where = {
          ...where,
          status: ctx.request.query.status,
        };
      }
      console.log("ctx.request.query.withoutQuesionnaire",ctx.request.query.withoutQuesionnaire);
      if (ctx.request.query.withoutQuesionnaire == "true") {
        console.log("ctx.request.query.withoutQuesionnaire",ctx.request.query.withoutQuesionnaire);
        where = {
          ...where,
          q_id: null,
        };
      }
      if (ctx.request.query.isAll == "true") {
        pagination={};
      }
      const findQuery = {
        where: where,
        include: [
          {
            model: 'vaccine_dose',
            as: 'vaccineDose',
          },
        ],
        order: [sortArr],  
        ...pagination,
        distinct: true,
      };
      let findResp = await dbService.findAndCountAll('vaccination_type', findQuery);
      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getListByClinician : async (ctx) => {
    try {
      const { sortArr, offset, limit } = commonService.paginationSortFilters(ctx);
      //find all vaccination_type id 
      let vaccinationType = await dbService.findAll('assign_vaccine_type', {
        where: {
          userId: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.query.userId,
        },
        attributes: ['vaccination_type_id'],
      });
      vaccinationType = vaccinationType.map((item) => item.vaccinationType);
      console.log(vaccinationType);
      let where = {
        uuid: {
          [Op.in]: vaccinationType,
        },
      };
      if (ctx.request.query.search) {
        where = {
          ...where,
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('vaccination_type.name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        };
      }
      if (ctx.request.query.status) {
        where = {
          ...where,
          status: ctx.request.query.status,
        };
      }
      const findQuery = {
        where: where,
        order: [sortArr],  
        offset,
        limit,
        distinct: true,
      };
      
      let findResp = await dbService.findAll('vaccination_type', findQuery);
      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n group--- find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
