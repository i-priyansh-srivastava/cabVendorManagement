const express = require('express');
const router = express.Router();
const { loginVendor } = require('../Controller/authController');
const { createRole } = require('../Controller/defaultPermission');
const { getVendorPermissions } = require('../Controller/permissionController');
const { addVendor } = require('../Controller/vendorController');
const { getRolesByLevel } = require('../Controller/getRolesByLevel');

router.post('/auth/login', loginVendor);
router.post('/set_default_role', createRole);
router.get('/vendors/permissions',getVendorPermissions);

router.post('/vendors', addVendor); 
router.get('/permissionByLevel', getRolesByLevel);



module.exports = router;