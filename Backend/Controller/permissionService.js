const Role = require('../models/Role');
const Permission = require('../models/Permission');
const Delegation = require('../models/Delegation');
const Vendor = require('../models/Vendor');

class PermissionService {
  // Get all permissions for a vendor (combining role and delegated permissions)
  static async getVendorPermissions(vendorId) {
    const vendor = await Vendor.findById(vendorId).populate('roles');
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Get role-based permissions
    const rolePermissions = new Set();
    for (const role of vendor.roles) {
      role.permissions.forEach(permission => rolePermissions.add(permission));
    }

    // Get delegated permissions
    const activeDelegations = await Delegation.find({
      delegateId: vendorId,
      status: 'ACTIVE',
      endDate: { $gt: new Date() }
    });

    const delegatedPermissions = new Set();
    for (const delegation of activeDelegations) {
      delegation.delegatedPermissions.forEach(permission => delegatedPermissions.add(permission));
    }

    // Combine and return all permissions
    return {
      rolePermissions: Array.from(rolePermissions),
      delegatedPermissions: Array.from(delegatedPermissions),
      allPermissions: Array.from(new Set([...rolePermissions, ...delegatedPermissions]))
    };
  }

  // Check if a vendor has a specific permission
  static async hasPermission(vendorId, requiredPermission) {
    const { allPermissions } = await this.getVendorPermissions(vendorId);
    return allPermissions.includes(requiredPermission);
  }

  // Check if a vendor can delegate a specific permission
  static async canDelegatePermission(delegatorId, permission) {
    const vendor = await Vendor.findById(delegatorId).populate('roles');
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Check if any role allows delegation
    for (const role of vendor.roles) {
      if (role.canDelegate && role.delegatablePermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  // Get all delegatable permissions for a vendor
  static async getDelegatablePermissions(vendorId) {
    const vendor = await Vendor.findById(vendorId).populate('roles');
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const delegatablePermissions = new Set();
    for (const role of vendor.roles) {
      if (role.canDelegate) {
        role.delegatablePermissions.forEach(permission => delegatablePermissions.add(permission));
      }
    }

    return Array.from(delegatablePermissions);
  }

  // Validate if a delegation request is valid
  static async validateDelegation(delegatorId, delegateId, permissions) {
    const delegator = await Vendor.findById(delegatorId).populate('roles');
    const delegate = await Vendor.findById(delegateId);

    if (!delegator || !delegate) {
      throw new Error('Invalid vendor IDs');
    }

    // Check hierarchy level
    if (delegate.level >= delegator.level) {
      throw new Error('Delegate must be at a lower level than delegator');
    }

    // Check if delegator can delegate these permissions
    const delegatablePermissions = await this.getDelegatablePermissions(delegatorId);
    for (const permission of permissions) {
      if (!delegatablePermissions.includes(permission)) {
        throw new Error(`Permission ${permission} cannot be delegated`);
      }
    }

    // Check geographical scope
    if (delegator.level === 2) { // Regional vendor
      if (delegate.region !== delegator.region) {
        throw new Error('Delegate must be in the same region');
      }
    } else if (delegator.level === 3) { // City vendor
      if (delegate.city !== delegator.city) {
        throw new Error('Delegate must be in the same city');
      }
    }

    return true;
  }

  // Get default roles for a vendor level
  static async getDefaultRoles(level) {
    return await Role.find({ level });
  }

  // Assign default role to a vendor
  static async assignDefaultRole(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const defaultRole = await Role.findOne({ level: vendor.level });
    if (!defaultRole) {
      throw new Error('No default role found for this level');
    }

    vendor.roles.push(defaultRole._id);
    await vendor.save();

    return defaultRole;
  }
}

module.exports = PermissionService; 