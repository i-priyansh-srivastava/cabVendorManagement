const Vendor = require('../Models/Vendor');

class VendorHierarchy {
  // Get all vendors under a specific region
  static async getVendorsByRegion(region) {
    // First get the regional vendor
    const regionalVendor = await Vendor.findOne({ 
      level: 2, // 1: Super Vendor, 2: Regional, 3: City, 4: Local
      region: region.toUpperCase() 
    });

    if (!regionalVendor) {
      return [];
    }

    // Get all descendants of the regional vendor
    return await this.getDescendants(regionalVendor._id);
  }

  // Get all vendors in a specific city
  static async getVendorsByCity(city) {
    // First get the city vendor
    const cityVendor = await Vendor.findOne({ 
      level: 3, // 1: Super Vendor, 2: Regional, 3: City, 4: Local
      city: city 
    });

    if (!cityVendor) {
      return [];
    }

    // Get all descendants of the city vendor
    return await this.getDescendants(cityVendor._id);
  }

  // Get all ancestors of a vendor
  static async getAncestors(vendorId) {
    const ancestors = [];
    let currentVendor = await Vendor.findById(vendorId);
    
    while (currentVendor && currentVendor.parentId) {
      currentVendor = await Vendor.findById(currentVendor.parentId);
      if (currentVendor) {
        ancestors.push(currentVendor);
      }
    }
    
    return ancestors;
  }

  // Get all descendants of a vendor
  static async getDescendants(vendorId) {
    const descendants = [];
    const queue = [vendorId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      const children = await Vendor.find({ parentId: currentId });
      
      for (const child of children) {
        descendants.push(child);
        queue.push(child._id);
      }
    }
    
    return descendants;
  }

  // Get the complete hierarchy tree for a region
  static async getRegionHierarchyTree(region) {
    const regionalVendor = await Vendor.findOne({ 
      level: 2, 
      region: region.toUpperCase() 
    });

    if (!regionalVendor) {
      return null;
    }

    return await this.getHierarchyTree(regionalVendor._id);
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
  //Why region? -- > to get the vendors in a specific region so that this method can be re-used 
  // to get vendors at a specific level both by Super and Regional vendor.
  static async getVendorsByLevelInRegion(level, region) {
    if (level === 2) {
      return await Vendor.find({ level: 2, region: region.toUpperCase() });
    }
    
    const regionalVendor = await Vendor.findOne({ 
      level: 2, 
      region: region.toUpperCase() 
    });

    if (!regionalVendor) {
      return [];
    }

    const descendants = await this.getDescendants(regionalVendor._id);
    return descendants.filter(vendor => vendor.level === level);
  }

  // Get all vendors in a specific branch
  static async getBranchVendors(vendorId) {
    const ancestors = await this.getAncestors(vendorId);
    const descendants = await this.getDescendants(vendorId);
    return [...ancestors, ...descendants];
  }
  
}

module.exports = VendorHierarchy; 