import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  MenuItem,
} from '@mui/material';
import AuthService from '../../services/authServices';
import axios from 'axios';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    numberPlate: '',
    color: '',
    brand: '',
    model: '',
    year: '',
    seating: '',
    permitNumber: '',
    pucNumber: '',
    pucExpiryDate: '',
    insuranceNumber: '',
    insuranceExpiryDate: '',
    fuelType: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);

  useEffect(() => {
    const vendor = AuthService.getCurrentVendor();
    setCurrentVendor(vendor?.vendor?.uniqueID);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'registrationNumber',
      'numberPlate',
      'color',
      'brand',
      'model',
      'year',
      'seating',
      'permitNumber',
      'pucNumber',
      'pucExpiryDate',
      'insuranceNumber',
      'insuranceExpiryDate',
      'fuelType',
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const fieldLabels = {
        registrationNumber: 'Registration Number',
        numberPlate: 'Number Plate',
        color: 'Color',
        brand: 'Brand',
        model: 'Model',
        year: 'Year',
        seating: 'Seating Capacity',
        permitNumber: 'Permit Number',
        pucNumber: 'PUC Number',
        pucExpiryDate: 'PUC Expiry Date',
        insuranceNumber: 'Insurance Number',
        insuranceExpiryDate: 'Insurance Expiry',
        fuelType: 'Fuel Type',
      };

      const missingFieldNames = missingFields.map(field => fieldLabels[field]);
      setError(`Please fill in the following required fields: ${missingFieldNames.join(', ')}`);
      return false;
    }

    // Additional validation for date fields
    const currentDate = new Date();
    const insuranceExpiry = new Date(formData.insuranceExpiryDate);
    const pucExpiry = new Date(formData.pucExpiryDate);

    if (insuranceExpiry < currentDate) {
      setError('Insurance expiry date cannot be in the past');
      return false;
    }

    if (pucExpiry < currentDate) {
      setError('PUC expiry date cannot be in the past');
      return false;
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (formData.year < 1900 || formData.year > currentYear) {
      setError(`Year must be between 1900 and ${currentYear}`);
      return false;
    }

    // Validate seating capacity
    if (formData.seating < 1 || formData.seating > 11) {
      setError('Seating capacity must be between 1 and 11');
      return false;
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

      // Create the vehicle
      await axios.post('http://localhost:5000/api/v1/vehicles', {
        ...formData,
        vendorUniqueID: currentVendor,
      });

      setSuccess('Vehicle added successfully');
      setFormData({
        registrationNumber: '',
        numberPlate: '',
        color: '',
        brand: '',
        model: '',
        year: '',
        seating: '',
        permitNumber: '',
        pucNumber: '',
        pucExpiryDate: '',
        insuranceNumber: '',
        insuranceExpiryDate: '',
        fuelType: '',
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setError(error.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Vehicle
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number Plate"
                name="numberPlate"
                value={formData.numberPlate}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seating Capacity"
                name="seating"
                type="number"
                value={formData.seating}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Permit Number"
                name="permitNumber"
                value={formData.permitNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PUC Number"
                name="pucNumber"
                value={formData.pucNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PUC Expiry Date"
                name="pucExpiryDate"
                type="date"
                value={formData.pucExpiryDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Number"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Expiry Date"
                name="insuranceExpiryDate"
                type="date"
                value={formData.insuranceExpiryDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Fuel Type"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                required
              >
                <MenuItem value="PETROL">Petrol</MenuItem>
                <MenuItem value="DIESEL">Diesel</MenuItem>
                <MenuItem value="CNG">CNG</MenuItem>
                <MenuItem value="ELECTRIC">Electric</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddVehicle; 