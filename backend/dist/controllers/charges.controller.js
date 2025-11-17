"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargesController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Zod validation schemas
const createOrUpdateChargeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    amount: zod_1.z.number().min(0),
});
const bulkUpdateChargesSchema = zod_1.z.object({
    charges: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1).max(50),
        amount: zod_1.z.number().min(0),
    })).min(1),
});
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
class ChargesController {
    // Get all charges
    static async getAllCharges(req, res) {
        try {
            const charges = await prisma.charges.findMany({
                orderBy: {
                    name: 'asc',
                },
            });
            return res.status(200).json({
                success: true,
                message: 'Charges fetched successfully',
                data: charges,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch charges',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Get single charge by ID
    static async getChargeById(req, res) {
        try {
            const validationResult = idParamSchema.safeParse(req.params);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid charge ID',
                    errors: validationResult.error.issues,
                });
            }
            const { id } = validationResult.data;
            const charge = await prisma.charges.findUnique({
                where: { id: Number(id) },
            });
            if (!charge) {
                return res.status(404).json({
                    success: false,
                    message: 'Charge not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: charge,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch charge',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Get charge by name
    static async getChargeByName(req, res) {
        try {
            const { name } = req.params;
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Charge name is required',
                });
            }
            const charge = await prisma.charges.findUnique({
                where: { name: name },
            });
            if (!charge) {
                return res.status(404).json({
                    success: false,
                    message: 'Charge not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: charge,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch charge',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Create or update charge (upsert)
    static async createOrUpdateCharge(req, res) {
        try {
            const validationResult = createOrUpdateChargeSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: validationResult.error.issues,
                });
            }
            const { name, amount } = validationResult.data;
            // Upsert charge (update if exists, create if not)
            const charge = await prisma.charges.upsert({
                where: { name },
                update: { amount },
                create: { name, amount },
            });
            return res.status(200).json({
                success: true,
                message: 'Charge saved successfully',
                data: charge,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to save charge',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Bulk update charges
    static async bulkUpdateCharges(req, res) {
        try {
            const validationResult = bulkUpdateChargesSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: validationResult.error.issues,
                });
            }
            const { charges } = validationResult.data;
            const results = {
                success: 0,
                failed: 0,
                errors: [],
                updated: [],
            };
            // Update each charge
            for (const chargeData of charges) {
                try {
                    const charge = await prisma.charges.upsert({
                        where: { name: chargeData.name },
                        update: { amount: chargeData.amount },
                        create: { name: chargeData.name, amount: chargeData.amount },
                    });
                    results.success++;
                    results.updated.push({
                        name: charge.name,
                        amount: Number(charge.amount),
                    });
                }
                catch (error) {
                    results.failed++;
                    results.errors.push({
                        name: chargeData.name,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
            return res.status(200).json({
                success: true,
                message: `Bulk update completed. Success: ${results.success}, Failed: ${results.failed}`,
                data: results,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Bulk update failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Delete charge
    static async deleteCharge(req, res) {
        try {
            const validationResult = idParamSchema.safeParse(req.params);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid charge ID',
                    errors: validationResult.error.issues,
                });
            }
            const { id } = validationResult.data;
            const charge = await prisma.charges.findUnique({
                where: { id: Number(id) },
            });
            if (!charge) {
                return res.status(404).json({
                    success: false,
                    message: 'Charge not found',
                });
            }
            await prisma.charges.delete({
                where: { id: Number(id) },
            });
            return res.status(200).json({
                success: true,
                message: 'Charge deleted successfully',
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete charge',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    // Initialize default charges (useful for first-time setup)
    static async initializeDefaultCharges(req, res) {
        try {
            const defaultCharges = [
                { name: 'fixed_charge_rate', amount: 0 },
                { name: 'electricity_charge_rate', amount: 0 },
                { name: 'electricity_duty_rate', amount: 0 },
                { name: 'maintenance_charge_rate', amount: 0 },
                { name: 'water_charge_rate', amount: 0 },
            ];
            const results = [];
            for (const charge of defaultCharges) {
                const result = await prisma.charges.upsert({
                    where: { name: charge.name },
                    update: {},
                    create: charge,
                });
                results.push(result);
            }
            return res.status(200).json({
                success: true,
                message: 'Default charges initialized successfully',
                data: results,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to initialize default charges',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.ChargesController = ChargesController;
//# sourceMappingURL=charges.controller.js.map