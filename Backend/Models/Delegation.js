const mongoose = require('mongoose');

const delegationSchema = new mongoose.Schema({
  // Who is delegating 
  delegatorId: {
    type: String,
    required: true,
    ref: 'Vendor',
    field: 'uniqueId'
  },
  // Who is receiving the delegation (must be at a lower level)
  delegateId: {
    type: String,
    required: true,
    ref: 'Vendor',
    field: 'uniqueId'
  },
  // Type of delegation
  delegationType: {
    type: String,
    required: true,
    enum: ['TEMPORARY', 'CONDITIONAL']
  },
  // Specific permissions being delegated
  delegatedPermissions: {
    type: [String],
    required: true
  },
  // Validity period
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: function() {
      return this.delegationType === 'TEMPORARY';
    }
  },
  // Status of delegation
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  // Audit trail
  auditLog: [{
    action: {
      type: String,
      required: true,
      enum: ['DELEGATION_CREATED', 'DELEGATION_REVOKED', 'CONDITIONS_UPDATED']
    },
    performedBy: {
      type: String,
      required: true,
      ref: 'Vendor',
      field: 'uniqueId'
    },
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Delegation = mongoose.model('Delegation', delegationSchema);

module.exports = Delegation; 