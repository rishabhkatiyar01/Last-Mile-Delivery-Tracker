const Joi = require('joi');

const createZone = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    pincodes: Joi.array().items(Joi.string()).required(),
  }),
};

const updateZonePincodes = {
  body: Joi.object().keys({
    pincodes: Joi.array().items(Joi.string()).required(),
  }),
};

const createRateCard = {
  body: Joi.object().keys({
    orderType: Joi.string().valid('B2B', 'B2C').required(),
    zoneRelation: Joi.string().valid('intra', 'inter').required(),
    baseRate: Joi.number().required(),
    perKgRate: Joi.number().required(),
    codSurchargeFlat: Joi.number(),
    codSurchargePercent: Joi.number(),
    isActive: Joi.boolean(),
  }),
};

const createAgent = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string(),
    zone: Joi.string().hex().length(24),
  }),
};

const createCustomer = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string(),
    address: Joi.string(),
  }),
};

module.exports = {
  createZone,
  updateZonePincodes,
  createRateCard,
  createAgent,
  createCustomer,
};
