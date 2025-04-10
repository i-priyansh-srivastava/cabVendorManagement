const express = require('express');
const router = express.Router();
const { loginVendor } = require('../Controller/authController');
router.post('/auth/login', loginVendor);




// const { addVendor } = require('../Controller/vendorController');
// router.post('/vendors', addVendor);


module.exports = router;