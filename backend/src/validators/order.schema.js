const Joi = require('joi');

const addressSchema = Joi.object({
  line: Joi.string().required(),
  pincode: Joi.string().required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});

const dimensionsSchema = Joi.object({
  l: Joi.number().required(),
  b: Joi.number().required(),
  h: Joi.number().required(),
});

const getQuote = {
  body: Joi.object().keys({
    pickupPincode: Joi.string().required(),
    dropPincode: Joi.string().required(),
    dimensions: dimensionsSchema.required(),
    actualWeight: Joi.number().required(),
    orderType: Joi.string().valid('B2B', 'B2C').required(),
    paymentType: Joi.string().valid('Prepaid', 'COD').required(),
  }),
};

const createOrder = {
  body: Joi.object().keys({
    pickupAddress: addressSchema.required(),
    dropAddress: addressSchema.required(),
    dimensions: dimensionsSchema.required(),
    actualWeight: Joi.number().required(),
    orderType: Joi.string().valid('B2B', 'B2C').required(),
    paymentType: Joi.string().valid('Prepaid', 'COD').required(),
    customerId: Joi.string().hex().length(24), // only for admin
  }),
};

const updateStatus = {
  body: Joi.object().keys({
    status: Joi.string()
      .valid('PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED')
      .required(),
    failureReason: Joi.string().when('status', {
      is: 'FAILED',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

const overrideStatus = {
  body: Joi.object().keys({
    status: Joi.string().required(),
    note: Joi.string().required(),
  }),
};

const assignAgent = {
  body: Joi.object().keys({
    agentId: Joi.string().hex().length(24).required(),
  }),
};

const reschedule = {
  body: Joi.object().keys({
    rescheduledDate: Joi.date().iso().required(),
  }),
};

module.exports = {
  getQuote,
  createOrder,
  updateStatus,
  overrideStatus,
  assignAgent,
  reschedule,
};
