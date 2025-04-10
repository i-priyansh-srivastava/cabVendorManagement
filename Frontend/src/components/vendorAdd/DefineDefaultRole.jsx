import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Checkbox, FormControlLabel, Grid, TextField, Typography, Divider
} from '@mui/material';

const defaultPermissions = {
  fleetManagement: {
    canManageFleet: false,
    canViewFleet: false,
    canAddVehicles: false,
    canRemoveVehicles: false,
    canUpdateVehicleDetails: false
  },
  driverManagement: {
    canOnboardDrivers: false,
    canVerifyDrivers: false,
    canViewDrivers: false,
    canUpdateDriverDetails: false,
    canRemoveDrivers: false
  },
  bookingManagement: {
    canCreateBookings: false,
    canViewBookings: false,
    canUpdateBookings: false,
    canCancelBookings: false
  },
  paymentManagement: {
    canProcessPayments: false,
    canViewPayments: false,
    canGenerateInvoices: false,
    canViewFinancialReports: false
  },
  complianceManagement: {
    canTrackCompliance: false,
    canViewComplianceReports: false,
    canUpdateComplianceStatus: false
  },
  vendorManagement: {
    canManageSubVendors: false,
    canViewSubVendors: false,
    canCreateSubVendors: false,
    canUpdateSubVendorDetails: false
  },
  reporting: {
    canViewReports: false,
    canGenerateReports: false,
    canExportReports: false
  }
};

const delegatableDefaults = {
  fleetManagement: {
    canManageFleet: false,
    canViewFleet: false,
    canAddVehicles: false
  },
  driverManagement: {
    canOnboardDrivers: false,
    canVerifyDrivers: false,
    canViewDrivers: false
  },
  bookingManagement: {
    canCreateBookings: false,
    canViewBookings: false
  },
  paymentManagement: {
    canProcessPayments: false,
    canViewPayments: false
  },
  complianceManagement: {
    canTrackCompliance: false,
    canViewComplianceReports: false
  }
};

const CreateRoleForm = () => {
  const [roleName, setRoleName] = useState('');
  const [level, setLevel] = useState(1);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [canDelegate, setCanDelegate] = useState(false);
  const [delegatablePermissions, setDelegatablePermissions] = useState(delegatableDefaults);

  const handlePermissionChange = (module, permission, isDelegatable = false) => {
    const updater = isDelegatable ? setDelegatablePermissions : setPermissions;
    const current = isDelegatable ? delegatablePermissions : permissions;

    updater({
      ...current,
      [module]: {
        ...current[module],
        [permission]: !current[module][permission]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      roleName,
      level,
      permissions,
      canDelegate,
      delegatablePermissions
    };
    try {
      const res = await axios.post('http://localhost:5000/api/v1/set_default_role', payload);
      alert('Role created successfully!');
      console.log(res.data);
    } catch (err) {
      alert('Error creating role');
      console.error(err);
    }
  };

  const renderCheckboxes = (group, label, isDelegatable = false) => (
    <>
      <Typography variant="h6" sx={{ mt: 2 }}>{label}</Typography>
      <Grid container spacing={2}>
        {Object.keys(group).map((key) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={group[key]}
                  onChange={() =>
                    handlePermissionChange(label, key, isDelegatable)
                  }
                />
              }
              label={key}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Create New Role</Typography>
      <TextField
        label="Role Name"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Level"
        type="number"
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        fullWidth
        required
        sx={{ mb: 2 }}
        inputProps={{ min: 1, max: 4 }}
      />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5">Permissions</Typography>
      {Object.entries(permissions).map(([module, perms]) =>
        renderCheckboxes(perms, module)
      )}

      <Divider sx={{ my: 2 }} />
      <FormControlLabel
        control={
          <Checkbox
            checked={canDelegate}
            onChange={() => setCanDelegate(!canDelegate)}
          />
        }
        label="Can Delegate Permissions"
      />
      {canDelegate && (
        <>
          <Typography variant="h5" sx={{ mt: 2 }}>Delegatable Permissions</Typography>
          {Object.entries(delegatablePermissions).map(([module, perms]) =>
            renderCheckboxes(perms, module, true)
          )}
        </>
      )}
      <Button type="submit" variant="contained" sx={{ mt: 3 }}>
        Create Role
      </Button>
    </Box>
  );
};

export default CreateRoleForm;
