import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountCircle,
  Logout,
  DirectionsCar,
  People,
  CalendarToday,
  Payment,
  Gavel,
  Business,
  Assessment
} from '@mui/icons-material';
import AuthService from '../../services/authServices';

const Dashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

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

        const vendorPermissions = await AuthService.getVendorPermissions();
        if (!vendorPermissions || !vendorPermissions.grantedPermissions) {
          throw new Error('Invalid permissions data structure');
        }
        setPermissions(vendorPermissions);
        console.log('Vendor Permissions:', vendorPermissions);
        
        // Set default module to first available one
        const modules = Object.keys(vendorPermissions.grantedPermissions);
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

  const renderPermissionCards = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
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

    if (!permissions || !selectedModule) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">No permissions data available</Alert>
        </Box>
      );
    }

    const modulePermissions = permissions.grantedPermissions[selectedModule];
    if (!modulePermissions) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">No permissions found for selected module</Alert>
        </Box>
      );
    }

    const permissionEntries = Object.entries(modulePermissions);

    return (
      <Grid container spacing={3}>
        {permissionEntries.map(([permission, value]) => (
          <Grid item xs={12} sm={6} md={4} key={permission}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: value ? '#e8f5e9' : '#ffebee'
              }}
            >
              <Typography variant="h6" gutterBottom>
                {value ? '✓' : '✗'} {permission}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {value ? 'Permission Granted' : 'Permission Not Granted'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
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
            marginTop: '64px'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {permissions && Object.keys(permissions.grantedPermissions).map((module) => (
              <ListItem
                button
                key={module}
                selected={selectedModule === module}
                onClick={() => handleModuleSelect(module)}
              >
                <ListItemIcon>
                  {getModuleIcon(module)}
                </ListItemIcon>
                <ListItemText primary={module.replace(/([A-Z])/g, ' $1').trim()} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            {selectedModule ? selectedModule.replace(/([A-Z])/g, ' $1').trim() : 'Select a Module'}
          </Typography>
          {renderPermissionCards()}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard; 
