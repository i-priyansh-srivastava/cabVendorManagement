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

    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        default: 'ACTIVE'
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId, //if driver is not assigned to a vehicle, sotres undefined
        ref: 'Vehicle'
    }
}, {
    timestamps: true
});

// Indexing for efficient & faster querying
driverSchema.index({ email: 1 }, { unique: true });
driverSchema.index({ licenseNumber: 1 }, { unique: true });
driverSchema.index({ vendorId: 1 });
driverSchema.index({ vehicleId: 1 });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver; 