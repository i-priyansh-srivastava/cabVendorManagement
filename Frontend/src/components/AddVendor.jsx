import React, { useState } from 'react';
import {
  Container, Box, TextField, Button, MenuItem, Typography, Paper, Alert
} from '@mui/material';
import axios from 'axios';

const regions = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL'];
const levels = [
  { value: 1, label: 'Super Vendor' },
  { value: 2, label: 'Regional' },
  { value: 3, label: 'City' },
  { value: 4, label: 'Local' },
];

const AddVendor = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', uniqueID: '', password: '', phone: '', address: '',
    level: 1, region: '', city: '', locality: '', status: 'ACTIVE'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/v1/vendors', formData);
      setSuccess('Vendor added successfully!');
      setFormData({
        name: '', email: '', uniqueID: '', password: '', phone: '', address: '',
        level: 1, region: '', city: '', locality: '', status: 'ACTIVE'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Add New Vendor</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth required label="Name" name="name" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth required label="Email" name="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth required label="Vendor ID" name="uniqueID" value={formData.uniqueID} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth required type="password" label="Password" name="password" value={formData.password} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth required label="Phone" name="phone" value={formData.phone} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth required label="Address" name="address" value={formData.address} onChange={handleChange} sx={{ mb: 2 }} />
          
          <TextField fullWidth select label="Level" name="level" value={formData.level} onChange={handleChange} sx={{ mb: 2 }}>
            {levels.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth select label="Region" name="region" value={formData.region} onChange={handleChange} sx={{ mb: 2 }}>
            {regions.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Locality" name="locality" value={formData.locality} onChange={handleChange} sx={{ mb: 2 }} />

          <TextField fullWidth select label="Status" name="status" value={formData.status} onChange={handleChange} sx={{ mb: 2 }}>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
          </TextField>

          <Button type="submit" variant="contained" fullWidth>Add Vendor</Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AddVendor;
