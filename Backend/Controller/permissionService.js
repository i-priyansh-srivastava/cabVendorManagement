const Permission = require('../Models/DefaultPermission');
const Delegation = require('../Models/Delegation');
const Vendor = require('../Models/Vendor');

// Get permissions for a vendor
exports.getPermissions = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const permissions = await Permission.findOne({ vendorId });
    if (!permissions) {
      return res.status(404).json({ message: 'Permissions not found' });
    }
    res.status(200).json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.deletePermissions = async (req, res) => {
  try {
    const { vendorUniqueID } = req.body;

    if (!vendorUniqueID) {
      return res.status(400).json({
        success: false,
        message: 'Vendor unique ID is required'
      });
    }

    const deletedPermissions = await Permission.findOneAndDelete({ vendorUniqueID });

    if (!deletedPermissions) {
      return res.status(404).json({
        success: false,
        message: 'Permissions not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Permissions deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting permissions',
      error: error.message
    });
  }
};

// Update permissions for a vendor
exports.updatePermissions = async (req, res) => {
  try {
    const { vendorUniqueID, parentName, grantedPermissions } = req.body;

    if (!vendorUniqueID || !parentName || !grantedPermissions) {
      return res.status(400).json({
        success: false,
        message: 'vendorUniqueID, parentName, and grantedPermissions are required'
      });
    }

    const existingPermission = await Permission.findOne({ vendorUniqueID });

    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'No permissions found for the provided vendorUniqueID'
      });
    }

    const historyUpdates = [];

    // Iterate over modules
    for (const moduleKey in grantedPermissions) {
      const newModulePerms = grantedPermissions[moduleKey];
      const existingModulePerms = existingPermission.grantedPermissions[moduleKey] || {};

      // Iterate over permissions within each module
      for (const permKey in newModulePerms) {
        const newVal = newModulePerms[permKey];
        const existingVal = existingModulePerms[permKey];

        if (newVal !== existingVal) {
          // Update the permission
          existingPermission.grantedPermissions[moduleKey][permKey] = newVal;

          // Push history entry
          historyUpdates.push({
            grantedBy: parentName,
            permission: `${moduleKey}.${permKey}`,
            timestamp: new Date(),
            notes: `Changed from ${existingVal} to ${newVal}`
          });
        }
      }
    }

    // Push to permissionHistory if there are changes
    if (historyUpdates.length > 0) {
      existingPermission.permissionHistory.push(...historyUpdates);
    }

    await existingPermission.save();

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      updatedChanges: historyUpdates,
      data: existingPermission
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating permissions',
      error: error.message
    });
  }
};


exports.getDelegations = async (req, res) => {
  try {
    const { vendorId, type } = req.body;

    if (!vendorId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID and type are required'
      });
    }

    let query = {};
    const now = new Date();

    if (type === 'delegator') {
      query = {
        delegatorId: vendorId,
        status: 'ACTIVE',
        $or: [
          { endDate: { $gt: now } },
          { endDate: null }
        ]   //to filter out expired delegations
      };
    } else if (type === 'delegate') {
      query = {
        delegateId: vendorId,
        status: 'ACTIVE',
        $or: [
          { endDate: { $gt: now } },
          { endDate: null }
        ]
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be either "delegator" or "delegate"'
      });
    }

    const delegations = await Delegation.find(query)
      .populate('delegatorId', 'name email') // populate with vendor details to show only 
      .populate('delegateId', 'name email'); //name and email of parent to child vendor

    const allPermissions = new Set();

    // Iterate over delegations and collect all unique permissions (union + distinct)
    delegations.forEach(delegation => {
      delegation.delegatedPermissions.forEach(perm => allPermissions.add(perm));
    });

    const mergedPermissions = Array.from(allPermissions);
    // console.log(mergedPermissions);


    res.status(200).json({
      success: true,
      data: delegations
    });

  } catch (error) {
    console.error('Error fetching delegations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delegations',
      error: error.message
    });
  }
};


exports.deleteDelegation = async (req, res) => {
  try {
    const { delegatorId, delegateId } = req.body;

    if (!delegatorId || !delegateId) {
      return res.status(400).json({
        success: false,
        message: 'Delegator ID and delegate ID are required'
      });
    }

    const deletedResult = await Delegation.deleteMany({
      delegatorId,
      delegateId
    });
    

    if (deletedResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No delegations found between the given vendors'
      });
    }
    

    res.status(200).json({
      success: true,
      message: 'Delegation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting delegation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting delegation',
      error: error.message
    });
  }
};

exports.createDelegation = async (req, res) => {
  try {
    const {
      delegatorId,
      delegateId,
      delegationType,
      delegatedPermissions,
      startDate,
      endDate
    } = req.body;

    // Basic validation
    if (!delegatorId || !delegateId || !delegationType || !delegatedPermissions || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: delegatorId, delegateId, delegationType, delegatedPermissions, startDate'
      });
    }

    // Check delegationType is valid
    const validTypes = ['TEMPORARY', 'CONDITIONAL'];
    if (!validTypes.includes(delegationType)) {
      return res.status(400).json({
        success: false,
        message: 'delegationType must be either TEMPORARY or CONDITIONAL'
      });
    }

    // For TEMPORARY, endDate is required and must be after startDate
    const start = new Date(startDate);
    let end = null;
    if (delegationType === 'TEMPORARY') {
      if (!endDate) {
        return res.status(400).json({
          success: false,
          message: 'endDate is required for TEMPORARY delegations'
        });
      }
      end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'endDate must be after startDate'
        });
      }
    }

    // Check for existing ACTIVE delegation between same vendors
    const existingDelegation = await Delegation.findOne({
      delegatorId,
      delegateId,
      status: 'ACTIVE'
    });

    // Create new delegation
    const newDelegation = new Delegation({
      delegatorId,
      delegateId,
      delegationType,
      delegatedPermissions,
      startDate: start,
      endDate: end,
      status: 'ACTIVE', // default status for new delegation
      auditLog: [{
        action: 'DELEGATION_CREATED',
        performedBy: delegatorId,
        details: 'Delegation initialized',
      }]
    });

    await newDelegation.save();

    res.status(201).json({
      success: true,
      message: 'Delegation created successfully',
      data: newDelegation
    });

  } catch (error) {
    console.error('Error creating delegation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delegation',
      error: error.message
    });
  }
};
