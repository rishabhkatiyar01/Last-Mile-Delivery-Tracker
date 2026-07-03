const Joi = require('joi');

const updateLocation = {
  body: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
};

const updateAvailability = {
  body: Joi.object().keys({
    status: Joi.string().valid('available', 'busy', 'offline').required(),
  }),
};

module.exports = {
  updateLocation,
  updateAvailability,
};
