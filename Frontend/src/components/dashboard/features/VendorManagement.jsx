import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import AuthService from '../../../services/authServices';
import AddSubVendor from '../../vendorAdd/AddSubVendor';

const VendorManagement = () => {
  const [showAddSubVendor, setShowAddSubVendor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [subVendors, setSubVendors] = useState([]);
  const [hierarchyStack, setHierarchyStack] = useState([]);

  const fetchSubVendors = async (parentID) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/vendors/byParent/${parentID}`);
      setSubVendors(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sub-vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const currentVendor = AuthService.getCurrentVendor();
      const parentID = currentVendor?.vendor?.uniqueID;
      setHierarchyStack([{ name: currentVendor?.vendor?.name, uniqueID: parentID }]);
      await fetchSubVendors(parentID);
    };
    initialize();
  }, []);

  const handleAddClick = () => {
    setShowAddSubVendor(true);
  };

  const handleBack = () => {
    setShowAddSubVendor(false);
  };

  const handleHierarchyBack = async () => {
    if (hierarchyStack.length <= 1) return; // Can't go higher than root
    const newStack = hierarchyStack.slice(0, -1);
    setHierarchyStack(newStack);
    const parentID = newStack[newStack.length - 1].uniqueID;
    await fetchSubVendors(parentID);
  };

  const handleCheckHierarchy = async (vendor) => {
    setHierarchyStack((prev) => [...prev, { name: vendor.name, uniqueID: vendor.uniqueID }]);
    await fetchSubVendors(vendor.uniqueID);
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
        Sub-vendors
      </Typography>

      {!showAddSubVendor ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <input
              type="text"
              placeholder="Search sub-vendors..."
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

          {/* Breadcrumb-like hierarchy info */}
          {hierarchyStack.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Button variant="outlined" onClick={handleHierarchyBack}>
                ← Back to {hierarchyStack[hierarchyStack.length - 2].name}'s Sub-vendors
              </Button>
            </Box>
          )}

          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
            <Grid container direction="column" spacing={2}>
              {subVendors.length > 0 ? (
                subVendors.map((vendor) => (
                  <Grid item key={vendor._id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6">{vendor.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unique ID: {vendor.uniqueID}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <Button variant="contained" color="primary">
                            Manage Vendor
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleCheckHierarchy(vendor)}
                          >
                            Check Hierarchy
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography variant="body1">No sub-vendors found.</Typography>
              )}
            </Grid>
          </Box>
        </>
      ) : (
        <Box>
          <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
            ← Back to Sub-vendors
          </Button>
          <AddSubVendor />
        </Box>
      )}
    </Box>
  );
};

export default VendorManagement;
