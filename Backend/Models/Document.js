const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['LICENSE', 'INSURANCE', 'REGISTRATION', 'PUC', 'PERMIT', 'OTHER']
  },
  url: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  expiryDate: {
    type: Date
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  }
}, {
  timestamps: true
});

documentSchema.index({ vendorId: 1 });
documentSchema.index({ vehicleId: 1 });
documentSchema.index({ driverId: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 