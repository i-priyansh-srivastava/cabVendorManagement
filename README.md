# Cab and Driver Onboarding & Vendor Hierarchy Management

## Project Overview
The Cab and Driver Onboarding System is designed to facilitate multi-level vendor management, streamline vehicle onboarding, verify documentation, and implement hierarchical access control. This system aims to enhance operational efficiency for Super Vendors and Sub Vendors managing fleets, driver onboarding, and compliance processes.

## Objectives
- *Implement a Flexible Multi-Level Vendor Hierarchy*: Enable Super Vendors to manage Sub Vendors across different operational levels while ensuring clear roles and responsibilities.
- *Centralize Vendor Management*: Provide Super Vendors with complete control over their Sub Vendors, including access to fleet operations and driver onboarding processes.
- *Enhance Operational Efficiency*: Streamline the delegation of tasks and responsibilities among vendors to reduce administrative overhead.
- *Vehicle & Driver Onboarding*: 
  - *Vehicles*: Enter vehicle details such as registration number, model, seating capacity, fuel type, etc.
  - *Drivers*: Add drivers and assign them to specific vehicles.

## Pathway in User Interface
<img src="/images/Login-till-dashboard.jpg" height="500" />
<img src="/images/FeaturesProvided.jpg" height="400" />

| Controller  | *loginVendor()*                                      |
|-------------|-----------------------------------------------|
| Desc        | Authenticates a vendor and issues JWT token (level + uniqueID) |
| Inputs      | uniqueID, password (from req.body)                            |

## Features Provided

## I. Multi-Level Vendor Hierarchy
- Vendors can operate at multiple levels, forming a parent-child relationship:
  - *National Vendor* → *Regional Vendor* → *City Vendor* → *Local Vendor*
- This hierarchy ensures that fleet management responsibilities are distributed, preventing operational bottlenecks.

<img src="/images/vendorSchema.png" height="400" />




| Controller  | *addVendor()*                                                 |
|---|------------------------------------------------------------------|
| *Desc* | Adds a new vendor to the system with validation and checks for parent vendor, region, and city matching. |
| *Inputs* | name, email, uniqueID, password, phone, address, level, region, city, locality, parentId (from req.body) |


| Controller  | *getVendorsByRegion()*                                          |
|---|-------------------------------------------------------------------|
| *Desc* | Retrieves all vendors under a specific region, starting with the regional vendor and fetching all its descendants. |
| *Inputs* | region (from req.params) |


| Controller  | *getVendorsByCity()*                                          |
|---|------------------------------------------------------------------|
| *Desc* | Retrieves all vendors under a specific city, starting with the city vendor and fetching all its descendants. |
| *Inputs* | city (from req.params)   |


| Controller  | *getAncestors()*                                             |
|---|-----------------------------------------------------------------|
| *Desc* | Fetches all ancestors (parent vendors) of a given vendor, moving up the vendor hierarchy. |
| *Inputs* | vendorId (from req.params) |


| Controller  | *getDescendants()*                                           |
|---|-----------------------------------------------------------------|
| *Desc* | Retrieves all descendants (sub-vendors) of a given vendor, exploring the vendor hierarchy. |
| *Inputs* | vendorUniqueID  |


| Controller  | *getImmediateChildren()*                                    |
|---|---------------------------------------------------------------|
| *Desc* | Fetches the immediate children (sub-vendors) of a given parent vendor. |
| *Inputs* | parentUniqueID (from req.params) |


| Controller  | *getRegionHierarchyTree()*                                   |
|---|---------------------------------------------------------------|
| *Desc* | Retrieves the entire hierarchy tree for a specific region, starting from the regional vendor. |
| *Inputs* | region (from req.params) |


|  Controller | *getHierarchyTree()*                                         |
|---|---------------------------------------------------------------|
| *Desc* | Recursively fetches the hierarchy tree of a vendor, including all descendants down to the leaf nodes. |
| *Inputs* | vendorId  |


| Controller  | *getVendorsByLevelInRegion()*                                |
|---|---------------------------------------------------------------|
| *Desc* | Retrieves vendors by a specific level within a given region. If level is 2 (regional vendors), directly fetches vendors from that level. For other levels, fetches descendants of the regional vendor. |
| *Inputs* | level, region (from req.params) |


|  Controller | *getBranchVendors()*                                          |
|---|---------------------------------------------------------------|
| *Desc* | Fetches all vendors in a specific branch, including both ancestors and descendants of a given vendor. |
| *Inputs* | vendorId  |


## II. Role-Based Access Management 
- Ensures clear access control for each vendor level.
- Define defautl roles for each level.
- Only accessible to National Vendor.

| Controller  | *getRolesByLevel()*                                          |
|---|---------------------------------------------------------------|
| *Desc* | Define defautl roles for each level. |
| *Inputs* | level uniqueID (from req.query) |


## III. Access Delegation to Sub Vendors

- *Functional System*: A fully operational vendor management system that allows Super Vendors to manage sub-vendor permissions effectively.
- *User Empowerment*: Sub-vendors now have the ability to perform designated tasks, enhancing their operational effectiveness while maintaining oversight from Super Vendors.
- *Continuity of Workflow*: Reduces administrative overhead for Super Vendors and ensures operations continue even if the Super Vendor is unavailable.

<img src="/images/delegationSchema.png" height="400" />

| Controller  | *createDelegation()*                            |
|-------------|-------------------------------------------|
| Desc        | Creates a delegation between vendors after validating level and region/city scope |
| Inputs      | delegatorId, delegateId, delegationData   |


| Controller  | *revokeDelegation()*                            |
|-------------|-------------------------------------------|
| Desc        | Revokes an active delegation by its delegator |
| Inputs      | delegationId (param), delegatorId (body)  |


| Controller  | *getActiveDelegations()*                        |
|-------------|-------------------------------------------|
| Desc        | Returns all active delegations for a vendor (given or received) |
| Inputs      | vendorId (param)                         |


| Controller  | *updateDelegationConditions()*                  |
|-------------|-------------------------------------------|
| Desc        | Updates conditions of an existing delegation |
| Inputs      | delegationId (param), delegatorId, newConditions (body) |


|  Controller | *getDelegationHistory()*                        |
|-------------|-------------------------------------------|
| Desc        | Returns delegation history (given or received) for a vendor |
| Inputs      | vendorId (param), type |


| Controller  | *canPerformAction()*                            |
|-------------|-------------------------------------------|
| Desc        | Checks if a delegate can perform an action on behalf of another vendor |
| Inputs      | delegateId, action, targetVendorId (params) |


| Controller  | *getDelegationsForLocalVendor()*                |
|-------------|-------------------------------------------|
| Desc        | Returns active delegations assigned to a specific local vendor |
| Inputs      | localVendorId (param)                    |



| Controller  | *getDelegationsByVendor()*                      |
|-------------|-------------------------------------------|
| Desc        | Returns all active delegations created by a vendor |
| Inputs      | vendorId (param)                         |

                                            
## IV. Fetch all default and delegated permissions

| Controller  | *getVendorPermissions()*                                                                 |
|---|---------------------------------------------------------------------------------------------|
| Desc   | Fetches permission document for a vendor based on their uniqueID                      |
| Inputs | uniqueID                                                                               |

| Controller  | *getPermissions()*                                          |
|---|---------------------------------------------------------------|
| *Desc* | Fetches the permissions for a specific vendor identified by vendorId. |
| *Inputs* | vendorId (from req.params)                                  |


| Controller  | *deletePermissions()*                                        |
|---|---------------------------------------------------------------|
| *Desc* | Deletes the permissions for a specific vendor identified by vendorUniqueID. |
| *Inputs* | vendorUniqueID (from req.body)                              |


| Controller  | *updatePermissions()*                                        |
|---|---------------------------------------------------------------|
| *Desc* | Updates permissions for a specific vendor and logs the changes in the permission history. |
| *Inputs* | vendorUniqueID, parentName, grantedPermissions (from req.body) |



| Controller  | *getDelegations()*                                          |
|---|---------------------------------------------------------------|
| *Desc* | Retrieves delegations for a vendor based on type (delegator or delegate). |
| *Inputs* | vendorId, type (from req.body)                            |

| Controller  | *deleteDelegation()*                                        |
|---|---------------------------------------------------------------|
| *Desc* | Deletes a delegation between two vendors based on their IDs. |
| *Inputs* | delegatorId, delegateId (from req.body)                  |


| Controller  | *createDelegation()*                                       |
|---|--------------------------------------------------------------|
| *Desc* | Creates a new delegation between two vendors with permissions, start date, and optional end date. |
| *Inputs* | delegatorId, delegateId, delegationType, delegatedPermissions, startDate, endDate (from req.body) |


## V. Cab and Driver Onboarding and Management

- *Vehicle Onboarding*: Enable sub-vendors to onboard cabs and commercial vehicles by inputting essential vehicle details such as registration number, model, seating capacity, and fuel type.
- *Driver Onboarding*: Allow sub-vendors to add drivers and assign them to specific vehicles, ensuring a clear association between drivers and their respective vehicles.
- *Document Management*: Facilitate the uploading of essential driver documents (Driving License, Vehicle Registration Certificate, Permit, and Pollution Certificate) to ensure all compliance requirements are met.

<img src="/images/driverVehicleSchema.jpg" height="400" />


|   | *addVehicle()*                                                                                      |
|---|--------------------------------------------------------------------------------------------------------|
| Desc   | Adds a new vehicle after validating input and ensuring uniqueness of registration and number plate |
| Inputs | registrationNumber, numberPlate, color, brand, model, year, seating, permitNumber, pucNumber, insuranceNumber, pucExpiryDate, insuranceExpiryDate, fuelType, vendorUniqueID, driverLicenceNumber |


|   | *addDriver()*                                                                                                                |
|---|---------------------------------------------------------------------------------------------------------------------------------|
| Desc   | Adds a new driver after validating input and checking for duplicates; optionally adds vehicle if the driver has own cab   |
| Inputs | name, email, phone, licenseNumber, licenseExpiry, address, hasOwnCab, cabDetails, vendorUniqueID                         |


|   | *getDrivers()*                                                                                   |
|---|-----------------------------------------------------------------------------------------------------|
| Desc   | Fetches all drivers associated with a vendor, including partial vehicle details               |
| Inputs | vendorId                                                                                       |

|   | *getDriverDetails()*                                                                             |
|---|-----------------------------------------------------------------------------------------------------|
| Desc   | Retrieves a single driver’s full details along with associated vehicle                         |
| Inputs | driverId                                                                                       |

|   | *updateDriver()*                                                                                 |
|---|-----------------------------------------------------------------------------------------------------|
| Desc   | Updates driver information based on provided data                                              |
| Inputs | driverId (param), updateData (body)                                                            |

|   | *deleteDriver()*                                                                                 |
|---|-----------------------------------------------------------------------------------------------------|
| Desc   | Deletes a driver and the associated vehicle if present                                         |
| Inputs | driverId
