const express = require('express');
const router = express.Router();
const { loginVendor } = require('../Controller/authController');
const { createRole } = require('../Controller/defaultPermission');
const { getVendorPermissions } = require('../Controller/permissionController');
const { addVendor } = require('../Controller/vendorController');
const { getRolesByLevel } = require('../Controller/getRolesByLevel');
const VendorHierarchy = require('../Controller/vendorHierarchy');
const { getDrivers, addDriver, addVehicle } = require('../Controller/driver_vehicleController');

router.post('/auth/login', loginVendor);
router.post('/set_default_role', createRole);
router.get('/vendors/permissions',getVendorPermissions);

router.post('/vendors', addVendor); 
router.get('/permissionByLevel', getRolesByLevel);
router.get('/vendors/byParent/:parentUniqueID', VendorHierarchy.getImmediateChildren);

router.post('/add_drivers', addDriver)
router.get('/byParent/:vendorId', getDrivers);
router.post('/vehicles', addVehicle)


module.exports = router;