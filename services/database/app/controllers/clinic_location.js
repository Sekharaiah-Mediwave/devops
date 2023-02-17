const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { moment } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const { Sequelize, sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

module.exports = {
  saveRecord: async (ctx) => {
    const transaction = await sequelize.transaction();
    try {
      const locationSavePayload = {
        address: ctx.request.body.address,
        postcode: ctx.request.body.postcode,
        city: ctx.request.body.city,
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body.userId,
      };

      const nameSavePayload = {
        name: ctx.request.body.name,
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body.userId,
      };

      const clinicNameLocationRelationPayload = {
        created_by: (ctx.req && ctx.req.decoded && ctx.req.decoded.uuid) || ctx.request.body.userId,
      };

      if (ctx.request.body.uuid) {
        locationSavePayload.uuid = ctx.request.body.uuid;
        clinicNameLocationRelationPayload.clinic_location_id = ctx.request.body.uuid;
      }

      if (ctx.request.body.location) {
        locationSavePayload.location = ctx.request.body.location;
        const findResp = await dbService.findOne('clinic_location', {
          where: {
            [Op.and]: [
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('location')), `${ctx.request.body.location.toLowerCase()}`),
            ]
          },
          transaction
        });

        if (findResp) {
          clinicNameLocationRelationPayload.clinic_location_id = findResp.uuid;
          locationSavePayload.uuid = findResp.uuid;
        } else {
          const locationSave = await dbService.create('clinic_location', locationSavePayload, { transaction });
          locationSavePayload.uuid = locationSave.uuid;
          clinicNameLocationRelationPayload.clinic_location_id = locationSave.uuid;
        }
      }

      if (ctx.request.body.clinic_name_id) {
        nameSavePayload.uuid = ctx.request.body.clinic_name_id;
        clinicNameLocationRelationPayload.clinic_name_id = ctx.request.body.clinic_name_id;
      }

      if (ctx.request.body.name) {
        const findResp = await dbService.findOne('clinic_name', {
          where: {
            [Op.and]: [
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), `${ctx.request.body.name.toLowerCase()}`),
            ]
          },
          transaction
        });

        if (findResp) {
          clinicNameLocationRelationPayload.clinic_name_id = findResp.uuid;
          nameSavePayload.uuid = findResp.uuid;
        } else {
          const nameSave = await dbService.create('clinic_name', nameSavePayload, { transaction });
          nameSavePayload.uuid = nameSave.uuid;
          clinicNameLocationRelationPayload.clinic_name_id = nameSave.uuid;
        }
      }

      const nameLocationExisitsFindResp = await dbService.findOne('clinic_name_location_relation', {
        where: {
          clinic_location_id: locationSavePayload.uuid,
          clinic_name_id: nameSavePayload.uuid,
        },
        transaction
      });

      if (nameLocationExisitsFindResp) {
        await transaction.rollback();
        return ctx.res.conflict({ msg: responseMessages[1173] });
      }

      const saveResp = await dbService.create('clinic_name_location_relation', clinicNameLocationRelationPayload, { transaction });
      await transaction.commit();
      return ctx.res.ok({ result: { clinicName: nameSavePayload, clinicLocation: locationSavePayload, relation: saveResp } });
    } catch (error) {
      console.log('\n group save error...', error);
      await transaction.rollback();
      return ctx.res.internalServerError({ error });
    }
  },
  getByLocation: async (ctx) => {
    try {
      const { sortArr, offset, limit } = commonService.paginationSortFilters(ctx);
      let where = {};
      if (ctx.request.body.search) {
        where = {
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('name')),
              'LIKE',
              `%${(ctx.request.body.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('location')),
              'LIKE',
              `%${(ctx.request.body.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('address')),
              'LIKE',
              `%${(ctx.request.body.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('postcode')),
              'LIKE',
              `%${(ctx.request.body.search || '').toLowerCase()}%`
            ),
          ],
        };
      }
      const date = ctx.request.body?.date;
      if (date) {
        const dateStart = moment(date).startOf('day').toISOString();
        const dateEnd = moment(date).endOf('day').toISOString();
        where = {
          ...where,
          createdAt: {
            [Op.gt]: dateStart,
            [Op.lt]: dateEnd
          }
        };
      }
      if (ctx.request.body.location) {
        where = {
          ...where,
          location: ctx.request.body.location
        };
      }
      const findResp = await dbService.findAndCountAll('clinic_location', {
        where,
        order: [sortArr],
        offset,
        limit,
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1174] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteLocationById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('clinic_location', {
        where: { uuid: ctx.request.query.clinic_location_id },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1174] });
        return;
      }
      const deleteResp = await dbService.update('clinic_location', { status: 'Deleted' }, { where: { uuid: findResp.uuid, } });
      const clinicNameLocationRelation = await dbService.findAll('clinic_name_location_relation', { where: { clinic_location_id: findResp.uuid } });
      const clinicNameLocationDelete = await dbService.update('clinic_name_location_relation', { status: 'Deleted' }, { where: { uuid: clinicNameLocationRelation.map(({ uuid }) => uuid) } });
      let clinicNamesDeleteResp;

      if (clinicNameLocationRelation[0]) {
        clinicNamesDeleteResp = await dbService.update('clinic_name', { status: 'Deleted' }, {
          where: {
            uuid: {
              [Op.in]: clinicNameLocationRelation.map(({ clinic_name_id }) => clinic_name_id)
            }
          }
        });
      }
      ctx.res.ok({ result: { location: deleteResp, names: clinicNamesDeleteResp, relation: clinicNameLocationDelete } });
      return;
    } catch (error) {
      console.log('\n deleteLocationById error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteNameById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('clinic_location', { where: { uuid: ctx.request.query.clinic_location_id }, });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1174] });
        return;
      }
      const nameFindResp = await dbService.findOne('clinic_name', { where: { uuid: ctx.request.query.clinic_name_id }, });

      if (!nameFindResp) {
        ctx.res.notFound({ msg: responseMessages[1198] });
        return;
      }

      const clinicNameLocationRelation = await dbService.findAll('clinic_name_location_relation', { where: { clinic_location_id: findResp.uuid, clinic_name_id: nameFindResp.uuid } });

      if (!clinicNameLocationRelation.length) {
        ctx.res.notFound({ msg: responseMessages[1208] });
        return;
      }

      const clinicNameLocationDelete = await dbService.update('clinic_name_location_relation', { status: 'Deleted' }, { where: { clinic_location_id: findResp.uuid, clinic_name_id: nameFindResp.uuid } });
      const clinicNamesDeleteResp = await dbService.update('clinic_name', { status: 'Deleted' }, { where: { uuid: nameFindResp.uuid } });
      ctx.res.ok({ result: { names: clinicNamesDeleteResp, relation: clinicNameLocationDelete } });
      return;
    } catch (error) {
      console.log('\n deleteNameById error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    const transaction = await sequelize.transaction();
    try {
      const locaationFind = await dbService.findOne('clinic_location', {
        where: {
          uuid: ctx.request.body.uuid,
        },
        transaction
      });

      if (!locaationFind) {
        await transaction.rollback();
        return ctx.res.notFound({ msg: responseMessages[1174] });
      }

      const nameFind = await dbService.findOne('clinic_name', {
        where: {
          uuid: ctx.request.body.clinic_name_id,
        },
        transaction
      });

      if (!nameFind) {
        await transaction.rollback();
        return ctx.res.notFound({ msg: responseMessages[1198] });
      }

      const locaationExistsFind = await dbService.findOne('clinic_location', {
        where: {
          uuid: {
            [Op.ne]: ctx.request.body.uuid
          },
          [Op.and]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('location')), `${ctx.request.body.location.toLowerCase()}`),
          ]
        },
        transaction
      });

      if (locaationExistsFind) {
        await transaction.rollback();
        return ctx.res.conflict({ msg: responseMessages[1173] });
      }

      const nameExistsFind = await dbService.findOne('clinic_name', {
        where: {
          uuid: {
            [Op.ne]: ctx.request.body.clinic_name_id
          },
          [Op.and]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), `${ctx.request.body.name.toLowerCase()}`),
          ]
        },
        transaction
      });

      if (nameExistsFind) {
        await transaction.rollback();
        return ctx.res.conflict({ msg: responseMessages[1173] });
      }

      const nameUpdatePayload = {
        name: ctx.request.body.name,
        updated_by: ctx.req.decoded.uuid,
      };

      const locationUpdatePayload = {
        location: ctx.request.body.location,
        address: ctx.request.body.address,
        postcode: ctx.request.body.postcode,
        city: ctx.request.body.city,
        updated_by: ctx.req.decoded.uuid
      };

      const locationUpdateResp = await dbService.update('clinic_location', locationUpdatePayload, { where: { uuid: ctx.request.body.uuid }, individualHooks: true, transaction }, {});
      const nameUpdateResp = await dbService.update('clinic_name', nameUpdatePayload, { where: { uuid: ctx.request.body.clinic_name_id }, individualHooks: true, transaction }, {});
      await transaction.commit();
      return ctx.res.ok({ result: { location: locationUpdateResp, name: nameUpdateResp } });
    } catch (error) {
      console.log('\n group update error...', error);
      await transaction.rollback();
      return ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const whereQuery = {};

      if (ctx.request.body.search) {
        whereQuery[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicName.name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.location')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.address')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.city')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('clinicLocation.postcode')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
        ];
      }

      if (ctx.request.body.fromDate && ctx.request.body.toDate) {
        whereQuery[Op.and] = [
          Sequelize.where(Sequelize.fn('date', Sequelize.col('clinicLocation.createdAt')), '>=', moment(ctx.request.body.fromDate).format('YYYY-MM-DD')),
          Sequelize.where(Sequelize.fn('date', Sequelize.col('clinicLocation.createdAt')), '<=', moment(ctx.request.body.toDate).format('YYYY-MM-DD'))
        ];
      }

      if (ctx.request.body.status && ctx.request.body.status.length) {
        whereQuery.status = {
          [Op.in]: ctx.request.body.status
        };
      }

      const findQuery = {
        subQuery: false,
        where: whereQuery,
        offset: ctx.request.body.offset,
        limit: ctx.request.body.limit,
        order: [ctx.request.body.order],
        // attributes: [
        //   'uuid',
        //   'location',
        //   'address',
        //   'postcode',
        //   'city',
        //   'status',
        //   [Sequelize.literal('(SELECT count(*) FROM clinic_name_location_relation cnr WHERE (("cnr"."status"!=\'Deleted\') and ( "cnr"."clinic_location_id"= "clinic_location"."uuid")))'), 'clinicNameCount']
        // ],
        include: [
          {
            model: 'clinic_location',
            as: 'clinicLocation',
            required: true
          },
          {
            model: 'clinic_name',
            as: 'clinicName',
            required: true
          },
        ]
      };

      // const { count, rows } = await dbService.findAndCountAll('clinic_name', findQuery);
      const { count, rows } = await dbService.findAndCountAll('clinic_name_location_relation', findQuery);
      ctx.res.ok({ result: { count, rows } });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getNameList: async (ctx) => {
    try {
      const whereQuery = {};

      if (ctx.request.body.search) {
        whereQuery[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
        ];
      }

      const findQuery = {
        distinct: true,
        where: whereQuery,
        offset: ctx.request.body.offset,
        limit: ctx.request.body.limit,
        order: [ctx.request.body.order],
        include: [
          {
            model: 'clinic_name_location_relation',
            as: 'clinicLocationRelation',
            required: true,
            attributes: []
          }
        ]
      };

      if (ctx.request.body.clinic_location_id) {
        findQuery.include[0].where = { clinic_location_id: ctx.request.body.clinic_location_id };
      }

      const { count, rows } = await dbService.findAndCountAll('clinic_name', findQuery);

      ctx.res.ok({ result: { count, rows } });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getLocationsList: async (ctx) => {
    try {
      const whereQuery = {};

      if (ctx.request.body.search) {
        whereQuery[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('location')), 'LIKE', `%${ctx.request.body.search.toLowerCase()}%`),
        ];
      }

      const findQuery = {
        distinct: true,
        where: whereQuery,
        offset: ctx.request.body.offset,
        limit: ctx.request.body.limit,
        order: [ctx.request.body.order],
        include: [
          {
            model: 'clinic_name_location_relation',
            as: 'clinicNameRelation',
            required: true,
            attributes: []
          }
        ]
      };

      const { count, rows } = await dbService.findAndCountAll('clinic_location', findQuery);

      ctx.res.ok({ result: { count, rows } });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('clinic_location', {
        where: { uuid: ctx.request.params.uuid },
        // include: [{
        //   model: 'clinic_name_location_relation',
        //   as: 'clinicNameRelation',
        //   required: true,
        //   include: [{
        //     model: 'clinic_name',
        //     as: 'clinicName',
        //     required: true,
        //   }]
        // }]
        include: [
          {
            model: 'clinic_name_location_relation',
            as: 'clinicNameRelation',
            required: true,
            attributes: []
          }
        ]
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1174] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getNameById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('clinic_name', {
        where: { uuid: ctx.request.params.uuid },
        // include: [{
        //   model: 'clinic_name_location_relation',
        //   as: 'clinicLocationRelation',
        //   required: true,
        //   include: [{
        //     model: 'clinic_location',
        //     as: 'clinicLocation',
        //     required: true,
        //   }]
        // }]
        include: [
          {
            model: 'clinic_name_location_relation',
            as: 'clinicLocationRelation',
            required: true,
            attributes: []
          }
        ]
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1198] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n getNameById error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
