const Role = require('../Models/Roles'); 

exports.createRole = async (req, res) => {
  try {
    const {
      roleName,
      level,
      permissions,
      canDelegate,
      delegatablePermissions
    } = req.body;


    const newRole = new Role({
      roleName,
      level,
      permissions,
      canDelegate,
      delegatablePermissions
    });

    await newRole.save();

    res.status(201).json({
      message: 'Role created successfully',
      role: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Role name must be unique.' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

