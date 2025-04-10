const Vendor = require('../Models/Vendor');
const bcrypt = require('bcryptjs');
exports.addVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      uniqueID,
      password,
      phone,
      address,
      level,
      region,
      city,
      locality,
      parentId,
    } = req.body;
    console.log('Received data:', req.body);
    console.log('Parent Unique ID:', parentId);
    // Validate required fields
    if (!name || !email || !password || !phone || !address || !level || !uniqueID|| !parentId) {
      return res.status(400).json({
        message: 'Name, email, password, phone, address, level, and uniqueID are required',
      });
    }

    // Check if vendor with the same email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    let resolvedRegion = region || null;
    let resolvedCity = city || null;

    // Validate parent vendor if provided
    if (parentId) {
      const parentVendor = await Vendor.findOne({ uniqueID: parentId });
      if (!parentVendor) {
        return res.status(400).json({ message: 'Parent vendor not found' });
      }

      if (parseInt(level) < parentVendor.level) {
        return res.status(400).json({
          message: 'Sub-vendor level must be greater than parent vendor level',
        });
      }

      // Ensure sub-vendor's region and city match parent
      if (parentVendor.region && region && region !== parentVendor.region) {
        return res.status(400).json({
          message: `Sub-vendor region (${region}) must match parent vendor region (${parentVendor.region})`,
        });
      }

      if (parentVendor.city && city && city !== parentVendor.city) {
        return res.status(400).json({
          message: `Sub-vendor city (${city}) must match parent vendor city (${parentVendor.city})`,
        });
      }

      // Override with parent’s region and city if defined
      resolvedRegion = parentVendor.region || resolvedRegion;
      resolvedCity = parentVendor.city || resolvedCity;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new vendor
    const newVendor = new Vendor({
      name,
      email,
      uniqueID,
      password: hashedPassword,
      phone,
      address,
      level: parseInt(level),
      region: resolvedRegion,
      city: resolvedCity,
      locality: locality || null,
      status: 'ACTIVE',
      parentId: parentId
    });

    await newVendor.save();

    const vendorData = {
      id: newVendor._id,
      name: newVendor.name,
      email: newVendor.email,
      uniqueID: newVendor.uniqueID,
      phone: newVendor.phone,
      address: newVendor.address,
      level: newVendor.level,
      region: newVendor.region,
      city: newVendor.city,
      locality: newVendor.locality,
      status: newVendor.status,
      parentId: newVendor.parentId,
      createdAt: newVendor.createdAt,
      updatedAt: newVendor.updatedAt
    };

    res.status(201).json(vendorData);
  } catch (error) {
    console.error('Vendor creation failed:', error);
    res.status(500).json({ message: error.message || 'Failed to create vendor' });
  }
};
