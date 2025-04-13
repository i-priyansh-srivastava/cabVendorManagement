import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, Grid, FormControlLabel, Checkbox, MenuItem, Divider, } from '@mui/material';
import AuthService from '../../services/authServices';
import axios from 'axios';

const AddDriver = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    hasOwnCab: false,
    // Cab details (only shown if hasOwnCab is true)
    cabDetails: {
      registrationNumber: '',
      numberPlate: '',
      color: '',
      brand: '',
      model: '',
      year: '',
      seating: '',
      permitNumber: '',
      pucNumber: '',
      insuranceNumber: '',
      pucExpiryDate: '',
      insuranceExpiry: '',
      insuranceExpiryDate: '',
      fuelType: '',
    }
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentVendor, setCurrentVendor] = useState('');

  useEffect(() => {
    const vendor = AuthService.getCurrentVendor();
    // console.log('Current Vendor:', vendor);
    // console.log('Current Vendor ID:', vendor?.vendor?.uniqueID);
    setCurrentVendor(vendor?.vendor?.uniqueID);
    console.log('Current Vendor:', currentVendor);
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === 'hasOwnCab') {
      setFormData(prev => ({
        ...prev,
        hasOwnCab: checked
      }));
    } else if (name.startsWith('cabDetails.')) {
      const cabField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cabDetails: {
          ...prev.cabDetails,
          [cabField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    // Basic driver validation
    if (!formData.name || !formData.email || !formData.phone || !formData.licenseNumber || !formData.licenseExpiry) {
      setError('Please fill in all required driver details');
      return false;
    }

    // Cab validation if hasOwnCab is true
    if (formData.hasOwnCab) {
      const requiredCabFields = [
        'registrationNumber',
        'numberPlate',
        'color',
        'brand',
        'model',
        'year',
        'seating',
        'permitNumber',
        'pucNumber',
        'insuranceNumber',
        'pucExpiryDate',
        'insuranceExpiryDate',
        'fuelType'
      ];

      const missingCabFields = requiredCabFields.filter(
        (field) => !formData.cabDetails[field]
      );

      if (missingCabFields.length > 0) {
        // Optional: Show error or set form validation error
        console.log('Missing Cab Fields:', missingCabFields);
        return;
      }
    }


    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      // First, create the driver
      const driverResponse = await axios.post('http://localhost:5000/api/v1/add_drivers', {
        ...formData,
        vendorUniqueID: currentVendor,
      });

      // console.log(currentVendor);
      // console.log('Driver Licence Number:', formData.licenseNumber);
      const driverLicenceNumber = formData.licenseNumber;
      if (driverResponse.data && formData.hasOwnCab) {
        // If driver has own cab, create the vehicle
        await axios.post(`http://localhost:5000/api/v1/Driver-owned-vehicles/${driverLicenceNumber}`, {
          ...formData.cabDetails,
          vendorUniqueID: currentVendor,
        });
      }

      setSuccess('Driver added successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiry: '',
        address: '',
        hasOwnCab: false,
        cabDetails: {
          registrationNumber: '',
          make: '',
          model: '',
          year: '',
          color: '',
          seatingCapacity: '',
          vehicleType: '',
          insuranceNumber: '',
          insuranceExpiry: '',
          numberPlate: '',
          brand: '',
          fuelType: '',
          pucNumber: '',
          pucExpiryDate: '',
        }
      });
    } catch (error) {
      console.error('Error adding driver:', error);
      setError(error.response?.data?.message || 'Failed to add driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Driver
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Driver Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Driver Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Expiry"
                name="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Has Own Cab Checkbox */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasOwnCab}
                    onChange={handleChange}
                    name="hasOwnCab"
                  />
                }
                label="Driver has own cab"
              />
            </Grid>

            {/* Cab Details (Conditional) */}
            {formData.hasOwnCab && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Cab Details
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    name="cabDetails.registrationNumber"
                    value={formData.cabDetails.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number Plate"
                    name="cabDetails.numberPlate"
                    value={formData.cabDetails.numberPlate}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Color"
                    name="cabDetails.color"
                    value={formData.cabDetails.color}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="cabDetails.brand"
                    value={formData.cabDetails.brand}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    name="cabDetails.model"
                    value={formData.cabDetails.model}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Year"
                    name="cabDetails.year"
                    type="number"
                    value={formData.cabDetails.year}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Seating Capacity"
                    name="cabDetails.seating"
                    type="number"
                    value={formData.cabDetails.seating}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Permit Number"
                    name="cabDetails.permitNumber"
                    value={formData.cabDetails.permitNumber}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PUC Number"
                    name="cabDetails.pucNumber"
                    value={formData.cabDetails.pucNumber}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance Number"
                    name="cabDetails.insuranceNumber"
                    value={formData.cabDetails.insuranceNumber}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PUC Expiry Date"
                    name="cabDetails.pucExpiryDate"
                    type="date"
                    value={formData.cabDetails.pucExpiryDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance Expiry Date"
                    name="cabDetails.insuranceExpiryDate"
                    type="date"
                    value={formData.cabDetails.insuranceExpiryDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Fuel Type"
                    name="cabDetails.fuelType"
                    value={formData.cabDetails.fuelType}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="PETROL">Petrol</MenuItem>
                    <MenuItem value="DIESEL">Diesel</MenuItem>
                    <MenuItem value="CNG">CNG</MenuItem>
                    <MenuItem value="ELECTRIC">Electric</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}


            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Adding...' : 'Add Driver'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddDriver;