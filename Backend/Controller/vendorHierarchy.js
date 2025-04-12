const Vendor = require('../Models/Vendor');

class VendorHierarchy {
  // Get all vendors under a specific region
  static async getVendorsByRegion(req, res) {
    try {
      const { region } = req.params;
      // First get the regional vendor
      const regionalVendor = await Vendor.findOne({ 
        level: 2, // 1: Super Vendor, 2: Regional, 3: City, 4: Local
        region: region.toUpperCase() 
      });

      if (!regionalVendor) {
        return res.status(200).json([]);
      }

      // Get all descendants of the regional vendor
      const descendants = await this.getDescendants(regionalVendor._id);
      return res.status(200).json(descendants);
    } catch (error) {
      console.error('Error fetching vendors by region:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get all vendors in a specific city
  static async getVendorsByCity(req, res) {
    try {
      const { city } = req.params;
      // First get the city vendor
      const cityVendor = await Vendor.findOne({ 
        level: 3, // 1: Super Vendor, 2: Regional, 3: City, 4: Local
        city: city 
      });

      if (!cityVendor) {
        return res.status(200).json([]);
      }

      // Get all descendants of the city vendor
      const descendants = await this.getDescendants(cityVendor._id);
      return res.status(200).json(descendants);
    } catch (error) {
      console.error('Error fetching vendors by city:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get all ancestors of a vendor
  static async getAncestors(req, res) {
    try {
      const { vendorId } = req.params;
      const ancestors = [];
      let currentVendor = await Vendor.findById(vendorId);
      
      while (currentVendor && currentVendor.parentId) {
        currentVendor = await Vendor.findById(currentVendor.parentId);
        if (currentVendor) {
          ancestors.push(currentVendor);
        }
      }

      return res.status(200).json(ancestors);
    } catch (error) {
      console.error('Error fetching ancestors:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get all descendants of a vendor
  static async getDescendants(vendorUniqueID) {
    const descendants = [];
    const queue = [vendorUniqueID];
  
    while (queue.length > 0) {
      const currentUniqueID = queue.shift();
      const currentVendor = await Vendor.findOne({ uniqueID: currentUniqueID });
  
      if (!currentVendor || !currentVendor.subVendorIDs) continue;
  
      const children = await Vendor.find({ uniqueID: { $in: currentVendor.subVendorIDs } });
  
      for (const child of children) {
        descendants.push(child);
        queue.push(child.uniqueID); // push child uniqueIDs to explore their children
      }
    }
  
    return descendants;
  }

  static async getImmediateChildren(req, res) {
    try {
      const { parentUniqueID } = req.params;
      const vendor = await Vendor.findOne({ uniqueID: parentUniqueID });

      if (!vendor || !vendor.subVendorIDs || vendor.subVendorIDs.length === 0) {
        return res.status(200).json([]);
      }

      const children = await Vendor.find({ uniqueID: { $in: vendor.subVendorIDs } });
      return res.status(200).json(children);
    } catch (error) {
      console.error('Error fetching immediate children:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get the complete hierarchy tree for a region
  static async getRegionHierarchyTree(req, res) {
    try {
      const { region } = req.params;
      const regionalVendor = await Vendor.findOne({ 
        level: 2, 
        region: region.toUpperCase() 
      });

      if (!regionalVendor) {
        return res.status(200).json(null);
      }

      const tree = await this.getHierarchyTree(regionalVendor._id);
      return res.status(200).json(tree);
    } catch (error) {
      console.error('Error fetching region hierarchy tree:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get the complete hierarchy tree from given vendor till leaf nodes
  static async getHierarchyTree(vendorId) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return null;

    const buildTree = async (currentVendor) => {
      const children = await Vendor.find({ parentId: currentVendor._id });
      const tree = {
        ...currentVendor.toObject(),
        children: []
      };

      for (const child of children) {
        tree.children.push(await buildTree(child));
      }

      return tree;
    };

    return buildTree(vendor);
  }

  // Get all vendors at a specific level in a region
  static async getVendorsByLevelInRegion(req, res) {
    try {
      const { level, region } = req.params;
      if (level === '2') {
        const vendors = await Vendor.find({ level: 2, region: region.toUpperCase() });
        return res.status(200).json(vendors);
      }
      
      const regionalVendor = await Vendor.findOne({ 
        level: 2, 
        region: region.toUpperCase() 
      });

      if (!regionalVendor) {
        return res.status(200).json([]);
      }

      const descendants = await this.getDescendants(regionalVendor._id);
      const vendorsAtLevel = descendants.filter(vendor => vendor.level === parseInt(level));
      return res.status(200).json(vendorsAtLevel);
    } catch (error) {
      console.error('Error fetching vendors by level in region:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get all vendors in a specific branch
  static async getBranchVendors(req, res) {
    try {
      const { vendorId } = req.params;
      const ancestors = await this.getAncestors({ params: { vendorId } }, res);
      const descendants = await this.getDescendants(vendorId);
      return res.status(200).json([...ancestors, ...descendants]);
    } catch (error) {
      console.error('Error fetching branch vendors:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = VendorHierarchy;
