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
  color: {
    type: String,
    required: true
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
    required: true,
    unique: true
  },
  //permitNumber expires after 9 years from date of insurance
  pucNumber: {
    type: String,
    required: true,
    unique: true
  },
  pucExpiryDate: {
    type: Date,
    required: true
  },
  insuranceNumber: { 
    type: String,
    required: true,
    unique: true
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
  vendorUniqueID: {
    type: String,
    required: true,
  },
  driverLicenceNumber: {
    type: String,
    unique: true,
    default: ""
  }

}, {
  timestamps: true
});


const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle; 