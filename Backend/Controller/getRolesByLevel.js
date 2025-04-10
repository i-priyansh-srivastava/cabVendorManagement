const DefaultPermission = require('../Models/DefaultPermission');
const Vendor = require('../Models/Vendor');
const Role = require('../Models/Roles');

exports.getRolesByLevel = async (req, res) => {
  try {
    const { level, uniqueID } = req.query;

    // Validate required data
    if (!uniqueID || !level) {
      return res.status(400).json({ message: 'Missing required fields: uniqueID or level' });
    }

    // Fetch the vendor from DB to get the _id for permission history
    const vendor = await Vendor.findOne({ uniqueID });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if permissions already exist
    const existing = await DefaultPermission.findOne({ vendorUniqueID: uniqueID });
    if (existing) {
      return res.status(400).json({ message: 'Default permissions already set for this vendor' });
    }

    // Fetch role-based permissions based on level
    const role = await Role.findOne({ level });
    if (!role) {
      return res.status(404).json({ message: 'No role found for the given level' });
    }

    const rolePermissions = role.permissions || [];

    // Create permission document
    const newPermission = new DefaultPermission({
      vendorUniqueID: uniqueID,
      vendorLevel: level,
      grantedPermissions: rolePermissions,
      permissionHistory: [
        {
          grantedBy: vendor._id,
          changeType: 'DEFAULT',
          permission: 'ALL',
          previousValue: false,
          newValue: true,
          conditions: {},
          timestamp: new Date(),
          notes: 'Initial permissions set based on vendor level'
        }
      ]
    });

    await newPermission.save();

    res.status(201).json({ message: 'Default permissions set successfully', data: newPermission });
  } catch (error) {
    console.error('Error setting default permissions:', error);
    res.status(500).json({ message: 'Failed to set default permissions', error: error.message });
  }
};
