const Driver = require('../Models/Driver');
const Vehicle = require('../Models/Vehicle');
const axios = require('axios');

// Add new vehicle
exports.addVehicle = async (req, res) => {
    try {
        const {
            registrationNumber,
            numberPlate,
            color,
            brand,
            model,
            year,
            seating,
            permitNumber,
            pucNumber,
            pucExpiryDate,
            insuranceNumber,
            insuranceExpiryDate,
            fuelType,
            vendorUniqueID,
        } = req.body;

        const driverLicenceNumber = req.params.driverLicenceNumber || "";

        console.log('Request body:', req.body);
        console.log('Driver Licence Number from params:', driverLicenceNumber);

        // Validate required vehicle fields
        if (
            !registrationNumber || !numberPlate || !color || !brand || !model || !year || !seating ||
            !permitNumber || !pucNumber || !insuranceNumber || !pucExpiryDate ||
            !insuranceExpiryDate || !fuelType || !vendorUniqueID
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required vehicle details'
            });
        }

        // Check for duplicates
        const existingVehicle = await Vehicle.findOne({
            $or: [
                { registrationNumber },
                { numberPlate }
            ]
        });

        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this registration number or number plate already exists'
            });
        }

        // Create and save new vehicle
        const vehicle = new Vehicle({
            registrationNumber,
            numberPlate,
            color,
            brand,
            model,
            year,
            seating,
            permitNumber,
            pucNumber,
            pucExpiryDate,
            insuranceNumber,
            insuranceExpiryDate,
            fuelType,
            vendorUniqueID,
            driverLicenceNumber,
        });

        await vehicle.save();

        return res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            data: vehicle
        });

    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding vehicle',
            error: error.message
        });
    }
};


// Add new driver with optional vehicle
exports.addDriver = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            licenseNumber,
            licenseExpiry,
            address,
            hasOwnCab,
            cabDetails,
            vendorUniqueID,
        } = req.body;
        // console.log('Request body:', req.body);

        // Validate required driver fields
        if (!name || !email || !phone || !licenseNumber || !licenseExpiry || !vendorUniqueID) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required driver details'
            });
        }

        // Check if driver with same email or phone already exists
        const existingDriver = await Driver.findOne({
            $or: [
                { email: email },
                { licenseNumber: licenseNumber }
            ]
        });

        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this email or phone number already exists'
            });
        }

        // Create new driver
        const driver = new Driver({
            name,
            email,
            phone,
            licenseNumber,
            licenseExpiryDate: licenseExpiry,
            address,
            hasOwnCab,
            vendorUniqueID,
            vehicleRegistrationNumber: hasOwnCab ? cabDetails.registrationNumber : null,
        });

        await driver.save();

        // If driver has own cab, create vehicle using the addVehicle method
        // if (hasOwnCab && cabDetails) {
        //     const vehicleResponse = await axios.post(`http://localhost:5000/api/v1/Driver-owned-vehicles/${cabDetails.licenseNumber}`, {
        //         ...cabDetails,
        //         vendorUniqueID
        //     });

        //     if (vehicleResponse.data.success) {
        //         return res.status(201).json({
        //             success: true,
        //             message: 'Driver and vehicle added successfully',
        //             data: {
        //                 driver,
        //                 vehicle: vehicleResponse.data.data
        //             }
        //         });
        //     } else {
        //         // If vehicle creation fails, delete the driver
        //         await Driver.findByIdAndDelete(driver._id);
        //         return res.status(400).json({
        //             success: false,
        //             message: 'Failed to add vehicle: ' + vehicleResponse.data.message
        //         });
        //     }
        // }

        return res.status(201).json({
            success: true,
            message: 'Driver added successfully',
            data: {
                driver
            }
        });

    } catch (error) {
        console.error('Error adding driver:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding driver',
            error: error.message
        });
    }
};

// Get all drivers for a vendor
exports.getDrivers = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const drivers = await Driver.find({ vendorUniqueID: vendorId });

        res.status(200).json({
            success: true,
            data: drivers
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching drivers',
            error: error.message
        });
    }
};

exports.getVehicles = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const vehicles = await Vehicle.find({ vendorUniqueID: vendorId });

        res.status(200).json({
            success: true,
            data: vehicles
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vehicles',
            error: error.message
        });
    }
};

// Update driver details
exports.updateDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const updateData = req.body;

        const driver = await Driver.findByIdAndUpdate(
            driverId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Driver updated successfully',
            data: driver
        });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating driver',
            error: error.message
        });
    }
};

// Delete driver and associated vehicle
exports.deleteDriver = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // If driver has a vehicle, delete it
        if (driver.vehicleId) {
            await Vehicle.findByIdAndDelete(driver.vehicleId);
        }

        await Driver.findByIdAndDelete(driverId);

        res.status(200).json({
            success: true,
            message: 'Driver and associated vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting driver',
            error: error.message
        });
    }
}; 