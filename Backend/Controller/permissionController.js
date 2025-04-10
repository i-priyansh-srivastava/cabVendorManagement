const permission = require('../Models/DefaultPermission');

exports.getVendorPermissions = async (req, res) => {
    try {
        const uniqueID = req.query.uniqueID;
    
        if (!uniqueID) {
          return res.status(400).json({ message: 'Vendor uniqueID is required' });
        }
    
        const permissionDoc = await permission.findOne({ vendorUniqueID: uniqueID });
    
        if (!permissionDoc) {
          return res.status(404).json({ message: 'Permissions not found for this vendor' });
        }
    
        res.status(200).json(permissionDoc);
      } catch (error) {
        console.error('Error fetching vendor permissions:', error);
        res.status(500).json({ message: 'Failed to fetch permissions', error: error.message });
      }
};

