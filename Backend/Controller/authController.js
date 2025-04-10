const Vendor = require('../Models/Vendor');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;

exports.loginVendor = async (req, res) => {
  try {
    const { uniqueID, password } = req.body;

    const vendor = await Vendor.findOne({ uniqueID });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: vendor._id, level: vendor.level, uniqueID: vendor.uniqueID },
      JWT_SECRET,
      { expiresIn: '7m' }
    );

    res.json({
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        uniqueID: vendor.uniqueID,
        email: vendor.email,
        level: vendor.level,
        region: vendor.region,
        city: vendor.city,
        locality: vendor.locality,
        status: vendor.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
