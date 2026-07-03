const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authSchema = require('../validators/auth.schema');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validate(authSchema.register), register);
router.post('/login', validate(authSchema.login), login);
router.get('/me', auth, getMe);

module.exports = router;
