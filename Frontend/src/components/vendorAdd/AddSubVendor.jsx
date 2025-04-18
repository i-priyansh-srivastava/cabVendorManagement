import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, Grid } from '@mui/material';
import AuthService from '../../services/authServices';
import axios from 'axios';

const AddSubVendor = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', uniqueID: '', password: '', phone: '', address: '', region: '', city: '', locality: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentVendor, setCurrentVendor] = useState(null);
  const [currentUniqueID, setCurrentUniqueID] = useState('');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const vendor = AuthService.getCurrentVendor();
    setCurrentVendor(vendor);
    setCurrentUniqueID(vendor?.vendor?.uniqueID);
    setCurrentLevel(parseInt(vendor?.vendor?.level || 0));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.uniqueID || !formData.password) {
      setError('All required fields must be filled');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    const subVendorLevel = currentLevel + 1;

    try {
      setLoading(true);

      const vendorResponse = await axios.post('http://localhost:5000/api/v1/vendors', {
        ...formData,
        level: subVendorLevel,
        parentId: currentUniqueID,
      });

      console.log('Vendor Response:', vendorResponse.data);

      try {
        const roleResponse = await axios.get(`http://localhost:5000/api/v1/permissionByLevel?level=${subVendorLevel}&uniqueID=${formData.uniqueID}`);
        console.log('Role Response:', roleResponse.data);
      } catch (err) {
        console.error('Failed to assign default permissions:', err);
      }

      setSuccess('Sub-vendor added successfully');
      setFormData({
        name: '',
        email: '',
        uniqueID: '',
        password: '',
        phone: '',
        address: '',
        region: '',
        city: '',
        locality: '',
      });
    } catch (error) {
      console.error('Error adding sub-vendor:', error);
      setError(error.response?.data?.message || 'Failed to add sub-vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add Sub-Vendor
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Current Vendor Level: {currentLevel} → New Sub-vendor Level: {currentLevel + 1}
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
              <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Unique ID" name="uniqueID" value={formData.uniqueID} onChange={handleChange} required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Region" name="region" value={formData.region} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Locality" name="locality" value={formData.locality} onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? 'Adding...' : 'Add Sub-Vendor'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddSubVendor;
