const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  numberPlate: {
    type: String,
    required: true,
    unique: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  seating: {
    type: Number,
    required: true
  },
  permitNumber: {
    type: String,
    required: true
  },
  //permitNumber expires after 9 years from date of insurance
  pucNumber: {
    type: String,
    required: true
  },
  pucExpiryDate: {
    type: Date,
    required: true
  },
  insuranceNumber: { 
    type: String,
    required: true
  },
  insuranceExpiryDate: {
    type: Date,
    required: true
  },
  fuelType: {
    type: String,
    enum: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC'],
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  }

}, {
  timestamps: true
});

// Index for efficient & faster querying
vehicleSchema.index({ registrationNumber: 1 }, { unique: true });
vehicleSchema.index({ numberPlate: 1 }, { unique: true });
vehicleSchema.index({ vendorId: 1 });
vehicleSchema.index({ driverId: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle; 