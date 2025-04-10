const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  // Default permissions for this role
  permissions: {
    fleetManagement: {
      canManageFleet: Boolean,
      canViewFleet: Boolean,
      canAddVehicles: Boolean,
      canRemoveVehicles: Boolean,
      canUpdateVehicleDetails: Boolean
    },
    driverManagement: {
      canOnboardDrivers: Boolean,
      canVerifyDrivers: Boolean,
      canViewDrivers: Boolean,
      canUpdateDriverDetails: Boolean,
      canRemoveDrivers: Boolean
    },
    bookingManagement: {
      canCreateBookings: Boolean,
      canViewBookings: Boolean,
      canUpdateBookings: Boolean,
      canCancelBookings: Boolean
    },
    paymentManagement: {
      canProcessPayments: Boolean,
      canViewPayments: Boolean,
      canGenerateInvoices: Boolean,
      canViewFinancialReports: Boolean
    },
    complianceManagement: {
      canTrackCompliance: Boolean,
      canViewComplianceReports: Boolean,
      canUpdateComplianceStatus: Boolean
    },
    vendorManagement: {
      canManageSubVendors: Boolean,
      canViewSubVendors: Boolean,
      canCreateSubVendors: Boolean,
      canUpdateSubVendorDetails: Boolean
    },
    reporting: {
      canViewReports: Boolean,
      canGenerateReports: Boolean,
      canExportReports: Boolean
    }
  },
  // Whether this role can delegate permissions
  canDelegate: {
    type: Boolean,
    default: false
  },
  // What permissions can be delegated
  delegatablePermissions: {
    fleetManagement: {
      canManageFleet: Boolean,
      canViewFleet: Boolean,
      canAddVehicles: Boolean
    },
    driverManagement: {
      canOnboardDrivers: Boolean,
      canVerifyDrivers: Boolean,
      canViewDrivers: Boolean
    },
    bookingManagement: {
      canCreateBookings: Boolean,
      canViewBookings: Boolean
    },
    paymentManagement: {
      canProcessPayments: Boolean,
      canViewPayments: Boolean
    },
    complianceManagement: {
      canTrackCompliance: Boolean,
      canViewComplianceReports: Boolean
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
// roleSchema.index({ level: 1 });
// roleSchema.index({ roleName: 1 }, { unique: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role; 