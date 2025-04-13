import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import AuthService from '../../../services/authServices';
import AddDriver from '../../onboarding/AddDriver';

const DriverManagement = () => {
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [hierarchyStack, setHierarchyStack] = useState([]);

  const fetchDrivers = async (parentID) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/drivers/byParent/${parentID}`);
      setDrivers(response.data.data);
      console.log('Fetched drivers:', response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const currentVendor = AuthService.getCurrentVendor();
      const parentID = currentVendor?.vendor?.uniqueID;
      setHierarchyStack([{ name: currentVendor?.vendor?.name, uniqueID: parentID }]);
      await fetchDrivers(parentID);
    };
    initialize();
  }, []);

  const handleAddClick = () => {
    setShowAddDriver(true);
  };

  const handleBack = () => {
    setShowAddDriver(false);
  };

  const handleHierarchyBack = async () => {
    if (hierarchyStack.length <= 1) return;
    const newStack = hierarchyStack.slice(0, -1);
    setHierarchyStack(newStack);
    const parentID = newStack[newStack.length - 1].uniqueID;
    await fetchDrivers(parentID);
  };


  const handleSearch = () => {
    console.log('Search term:', searchTerm);
    // filtering logic
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
        Drivers
      </Typography>

      {!showAddDriver ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <input
              type="text"
              placeholder="Search drivers..."
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

          {hierarchyStack.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Button variant="outlined" onClick={handleHierarchyBack}>
                ← Back to {hierarchyStack[hierarchyStack.length - 2].name}'s Drivers
              </Button>
            </Box>
          )}

          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
            <Grid container direction="column" spacing={2}>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <Grid item key={driver._id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6">{driver.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          License: {driver.licenseNumber}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Contact: {driver.phone}
                        </Typography>

                        {driver.vehicleRegistrationNumber ? (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              Registration No: {driver.vehicleRegistrationNumber}
                            </Typography>
                            
                          </Box>
                        ) : (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              No vehicle assigned
                            </Typography>
                            <Button
                              variant="outlined"
                              color="warning"
                              sx={{ mt: 1 }}
                              onClick={() => console.log('Assign vehicle for', driver.name)}
                            >
                              Assign Vehicle
                            </Button>
                          </Box>
                        )}

                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <Button variant="contained" color="primary">
                            Manage Driver
                          </Button>

                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography variant="body1">No drivers found.</Typography>
              )}

            </Grid>
          </Box>
        </>
      ) : (
        <Box>
          <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
            ← Back to Drivers
          </Button>
          <AddDriver />
        </Box>
      )}
    </Box>
  );
};

export default DriverManagement;
