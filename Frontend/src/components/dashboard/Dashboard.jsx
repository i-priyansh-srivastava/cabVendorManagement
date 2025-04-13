import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, AppBar, Toolbar, IconButton, Menu,
  MenuItem, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress, Alert } from '@mui/material';
import { Dashboard as DashboardIcon, AccountCircle, Logout, DirectionsCar, People, CalendarToday,
  Payment, Gavel, Business, Assessment } from '@mui/icons-material';
import AuthService from '../../services/authServices';
import axios from 'axios';

import VendorManagement from './features/VendorManagement';
import DriverManagement from './features/DriverManagement';
import FleetManagement from './features/FleetManagement';
// import BookingManagement from './features/manageBookings';
// import PaymentManagement from './features/managePayments';
// import ComplianceManagement from './features/manageCompliance';
// import Reporting from './features/manageReporting';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const API_URL = 'http://localhost:5000/api/v1';

const Dashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);

  const moduleComponentMap = {
    vendorManagement: <VendorManagement />,
    driverManagement: <DriverManagement />,
    fleetManagement: <FleetManagement />,
    // bookingManagement: <BookingManagement />,
    // paymentManagement: <PaymentManagement />,
    // complianceManagement: <ComplianceManagement />,
    // reporting: <Reporting />,
  };

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentVendor = AuthService.getCurrentVendor();
        if (!currentVendor) {
          throw new Error('No vendor data found');
        }
        setVendor(currentVendor);
        const uniqueID = currentVendor?.vendor?.uniqueID;

        const vendorPermissions = await axios.get(`${API_URL}/vendors/permissions`, {
          params: { uniqueID },
          headers: {
            Authorization: `Bearer ${currentVendor.token}`
          }
        });
        setPermissions(vendorPermissions.data);
        console.log('Vendor Permissions:', vendorPermissions.data);

        // Set default module to first available one
        const modules = Object.keys(vendorPermissions.data.grantedPermissions);
        if (modules.length > 0) {
          setSelectedModule(modules[0]);
        }
      } catch (error) {
        console.error('Failed to load vendor data:', error);
        setError(error.message || 'Failed to load vendor data');
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, []);

  useEffect(() => {
    if (selectedModule && moduleComponentMap[selectedModule]) {
      setModuleContent(moduleComponentMap[selectedModule]);
    } else if (selectedModule) {
      // If component not found for module, show fallback
      setModuleContent(
        <Box sx={{ p: 3 }}>
          <Alert severity="info">No UI component available for this module yet.</Alert>
        </Box>
      );
    }
  }, [selectedModule]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const getModuleIcon = (moduleName) => {
    switch (moduleName) {
      case 'fleetManagement':
        return <DirectionsCar />;
      case 'driverManagement':
        return <People />;
      case 'bookingManagement':
        return <CalendarToday />;
      case 'paymentManagement':
        return <Payment />;
      case 'complianceManagement':
        return <Gavel />;
      case 'vendorManagement':
        return <Business />;
      case 'reporting':
        return <Assessment />;
      default:
        return <DashboardIcon />;
    }
  };

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vendor Dashboard
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleMenu}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Avatar sx={{ mr: 1 }}>{vendor?.name?.[0]}</Avatar>
              {vendor?.name}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {permissions?.grantedPermissions && Object.entries(permissions.grantedPermissions).map(([module, perms]) => (
              <ListItem
                button
                key={module}
                selected={selectedModule === module}
                onClick={() => handleModuleSelect(module)}
                disabled={!Object.values(perms).some(v => v)}
              >
                <ListItemIcon>
                  {getModuleIcon(module)}
                </ListItemIcon>
                <ListItemText
                  primary={module.charAt(0).toUpperCase() + module.slice(1).replace(/([A-Z])/g, ' $1')}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          moduleContent
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
