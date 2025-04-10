const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  uniqueID: {
    type: String,
    required: true
  },
  password: { 
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4], // 1: Super Vendor, 2: Regional, 3: City, 4: Local
    default: 1
  },
  region: {
    type: String,
    enum: ['NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL', null],
    default: null
  },
  city: {
    type: String,
    default: null
  },
  locality: { 
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
}, {
  timestamps: true
});

// Compound indexing for efficient querying
vendorSchema.index({ level: 1, region: 1 });
vendorSchema.index({ level: 1, city: 1 });
vendorSchema.index({ level: 1, locality: 1 });
vendorSchema.index({ parentId: 1 });
vendorSchema.index({ email: 1 }, { unique: true });

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor; 