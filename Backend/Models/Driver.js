const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    licenseExpiryDate: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    hasOwnCab: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        default: 'ACTIVE'
    },
    vendorUniqueID: {
        type: String,
        required: true,
    },
    vehicleRegistrationNumber: {
        type: String,
        default: "",
    }
}, {
    timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver; 