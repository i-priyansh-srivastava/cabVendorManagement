const Delegation = require('../Models/Delegation');
const Vendor = require('../Models/Vendor');

class delegationController {
    static async createDelegation(req, res) {
        try {
            const { delegatorId, delegateId, ...delegationData } = req.body;

            // Get delegator and delegate using uniqueId
            const [delegator, delegate] = await Promise.all([
                Vendor.findOne({ uniqueId: delegatorId }),
                Vendor.findOne({ uniqueId: delegateId })
            ]);

            if (!delegator || !delegate) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid vendor IDs'
                });
            }

            // Validate hierarchy level
            if (delegate.level >= delegator.level) {
                return res.status(400).json({
                    success: false,
                    message: 'Delegate must be at a lower level than delegator'
                });
            }

            // Validate geographical scope
            if (delegator.level === 2) { // Regional vendor
                if (delegate.region !== delegator.region) {
                    return res.status(400).json({
                        success: false,
                        message: 'Delegate must be in the same region'
                    });
                }
            }

            else if (delegator.level === 3) { // City vendor
                if (delegate.city !== delegator.city) {
                    return res.status(400).json({
                        success: false,
                        message: 'Delegate must be in the same city'
                    });
                }
            }

            // Create the delegation
            const delegation = new Delegation({
                delegatorId,
                delegateId,
                ...delegationData,
                auditLog: [{
                    action: 'DELEGATION_CREATED',
                    performedBy: delegatorId,
                    details: 'Delegation created'
                }]
            });

            const savedDelegation = await delegation.save();

            res.status(201).json({
                success: true,
                data: savedDelegation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create delegation',
                error: error.message
            });
        }
    }

    // Revoke a delegation
    static async revokeDelegation(req, res) {
        try {
            const { delegationId } = req.params;
            const { delegatorId } = req.body;

            const delegation = await Delegation.findById(delegationId);
            if (!delegation) {
                return res.status(404).json({
                    success: false,
                    message: 'Delegation not found'
                });
            }

            if (delegation.delegatorId !== delegatorId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only the delegator can revoke the delegation'
                });
            }

            delegation.status = 'REVOKED';
            delegation.auditLog.push({
                action: 'DELEGATION_REVOKED',
                performedBy: delegatorId,
                details: 'Delegation revoked by delegator'
            });

            const updatedDelegation = await delegation.save();

            res.status(200).json({
                success: true,
                data: updatedDelegation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to revoke delegation',
                error: error.message
            });
        }
    }

    // Get all active delegations for a vendor
    static async getActiveDelegations(req, res) {
        try {
            const { vendorId } = req.params;

            const delegations = await Delegation.find({
                $or: [{ delegatorId: vendorId }, { delegateId: vendorId }],
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            }).populate({
                path: 'delegatorId delegateId',
                select: 'name level location',
                match: { uniqueId: { $exists: true } }
            });

            res.status(200).json({
                success: true,
                data: delegations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch active delegations',
                error: error.message
            });
        }
    }

    // Update delegation conditions
    static async updateDelegationConditions(req, res) {
        try {
            const { delegationId } = req.params;
            const { delegatorId, newConditions } = req.body;

            const delegation = await Delegation.findById(delegationId);
            if (!delegation) {
                return res.status(404).json({
                    success: false,
                    message: 'Delegation not found'
                });
            }

            if (delegation.delegatorId !== delegatorId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only the delegator can update delegation conditions'
                });
            }

            delegation.conditions = {
                ...delegation.conditions,
                ...newConditions
            };

            delegation.auditLog.push({
                action: 'CONDITIONS_UPDATED',
                performedBy: delegatorId,
                details: 'Delegation conditions updated'
            });

            const updatedDelegation = await delegation.save();

            res.status(200).json({
                success: true,
                data: updatedDelegation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update delegation conditions',
                error: error.message
            });
        }
    }

    // Get delegation history for a vendor
    static async getDelegationHistory(req, res) {
        try {
            const { vendorId } = req.params;
            const { type } = req.query; // 'given' or 'received'

            let query = {};
            if (type === 'given') {
                query.delegatorId = vendorId;
            } else if (type === 'received') {
                query.delegateId = vendorId;
            }

            const delegations = await Delegation.find(query)
                .populate({
                    path: 'delegatorId delegateId',
                    select: 'name level location',
                    match: { uniqueId: { $exists: true } }
                })
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                data: delegations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch delegation history',
                error: error.message
            });
        }
    }

    // Check if a vendor can perform an action on behalf of another
    static async canPerformAction(req, res) {
        try {
            const { delegateId, action, targetVendorId } = req.params;

            const activeDelegations = await Delegation.find({
                delegateId,
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            });

            for (const delegation of activeDelegations) {
                if (delegation.delegatedPermissions.includes(action)) {
                    const targetVendor = await Vendor.findOne({ uniqueId: targetVendorId });
                    if (!targetVendor) {
                        return res.status(404).json({
                            success: false,
                            message: 'Target vendor not found'
                        });
                    }

                    if (delegation.conditions.allowedLocalVendors?.length > 0) {
                        if (!delegation.conditions.allowedLocalVendors.includes(targetVendorId)) {
                            continue;
                        }
                    }

                    if (delegation.conditions.allowedRegions?.length > 0) {
                        if (!delegation.conditions.allowedRegions.includes(targetVendor.region)) {
                            continue;
                        }
                    }

                    if (delegation.conditions.allowedCities?.length > 0) {
                        if (!delegation.conditions.allowedCities.includes(targetVendor.city)) {
                            continue;
                        }
                    }

                    return res.status(200).json({
                        success: true,
                        data: { canPerform: true }
                    });
                }
            }

            res.status(200).json({
                success: true,
                data: { canPerform: false }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to check action permission',
                error: error.message
            });
        }
    }

    // Get all delegations for a specific local vendor
    static async getDelegationsForLocalVendor(req, res) {
        try {
            const { localVendorId } = req.params;

            const delegations = await Delegation.find({
                delegateId: localVendorId,
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            }).populate({
                path: 'delegatorId',
                select: 'name level location',
                match: { uniqueId: { $exists: true } }
            });

            res.status(200).json({
                success: true,
                data: delegations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch local vendor delegations',
                error: error.message
            });
        }
    }

    // Get all delegations created by a vendor
    static async getDelegationsByVendor(req, res) {
        try {
            const { vendorId } = req.params;

            const delegations = await Delegation.find({
                delegatorId: vendorId,
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            }).populate({
                path: 'delegateId',
                select: 'name level location',
                match: { uniqueId: { $exists: true } }
            });

            res.status(200).json({
                success: true,
                data: delegations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch vendor delegations',
                error: error.message
            });
        }
    }
}

module.exports = delegationController; 