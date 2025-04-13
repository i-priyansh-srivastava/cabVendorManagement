import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import AuthService from '../../../services/authServices';
import AddVehicle from '../../onboarding/AddVehicle';

const FleetManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const fetchVehicles = async (vendorId) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/vehicles/byParent/${vendorId}`
      );
      setVehicles(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const currentVendor = AuthService.getCurrentVendor();
      const vendorId = currentVendor?.vendor?.uniqueID;
      if (vendorId) {
        await fetchVehicles(vendorId);
      } else {
        setError('Vendor ID not found');
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
    // Implement actual search/filter logic here
  };

  const handleAddClick = () => {
    setShowAddVehicle(true);
  };

  const handleBack = () => {
    setShowAddVehicle(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vehicles
      </Typography>

      {!showAddVehicle ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid #ccc',
                fontSize: '16px'
              }}
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAddClick}
              sx={{ fontSize: '20px', fontWeight: 'bold' }}
            >
              +
            </Button>
          </Box>

          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
            <Grid container direction="column" spacing={2}>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <Grid item key={vehicle._id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6">
                          {vehicle.registrationNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Model: {vehicle.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Brand: {vehicle.brand}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Year: {vehicle.year}
                        </Typography>

                        {vehicle.driverLicenceNumber ? (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Assigned to Driver: {vehicle.driverLicenceNumber}
                          </Typography>
                        ) : (
                          <Button
                            variant="outlined"
                            color="warning"
                            sx={{ mt: 2 }}
                            onClick={() =>
                              console.log('Assign driver to', vehicle.registrationNumber)
                            }
                          >
                            Assign Driver
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography variant="body1">No vehicles found.</Typography>
              )}
            </Grid>
          </Box>
        </>
      ) : (
        <Box>
          <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
            ← Back to Vehicles
          </Button>
          <AddVehicle onSuccess={handleBack} />
        </Box>
      )}
    </Box>
  );
};

export default FleetManagement;
