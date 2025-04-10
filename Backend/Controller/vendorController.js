const Vendor = require('../Models/Vendor');
const bcrypt = require('bcryptjs');
exports.addVendor = async (req, res) => {
  try {
    //Hash the password before saving it to the database
    if (!req.body.password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword; 

    const newVendor = new Vendor(req.body);
    await newVendor.save();
    res.status(201).json({ message: 'Vendor created successfully' });
  } catch (error) {
    console.error('Vendor creation failed:', error);
    res.status(500).json({ message: error.message || 'Failed to create vendor' });
  }
};
