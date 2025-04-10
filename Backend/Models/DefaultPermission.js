const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  // Reference to the vendor using uniqueID
  vendorUniqueID: {
    type: String,
    required: true,
    unique: true
  },
  // Vendor's level in the hierarchy
  vendorLevel: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4] // 1: Super, 2: Regional, 3: City, 4: Local
  },
  // All granted permissions (both default and delegated)
  grantedPermissions: {
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
  // History of permission changes for security reasons to track who took the action
  permissionHistory: [{
    // Who granted/revoked the permission
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    // Type of permission change (DEFAULT, DELEGATED, REVOKED)
    changeType: {
      type: String,
      required: true,
      enum: ['DEFAULT', 'DELEGATED', 'REVOKED']
    },
    // The permission that was changed (e.g., "fleetManagement.canManageFleet")
    permission: {
      type: String,
      required: true
    },
    // Previous value
    previousValue: {
      type: Boolean,
      required: true
    },
    // New value
    newValue: {
      type: Boolean,
      required: true
    },
    // Additional conditions for delegated permissions
    conditions: {
      requiresApproval: {
        type: Boolean,
        default: false
      },
      maxAmount: {
        type: Number,
        default: null
      },
      allowedLocations: [{
        type: String
      }]
    },
    // For temporary delegations
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
// permissionSchema.index({ vendorId: 1 });
// permissionSchema.index({ vendorLevel: 1 });
// permissionSchema.index({ 'permissionHistory.grantedBy': 1 });

const DefaultPermission = mongoose.model('Permission', permissionSchema);

module.exports = DefaultPermission;