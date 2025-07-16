"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBehaviorController = void 0;
const service_1 = require("./service");
const VALID_INTERACTIONS = ['VIEW', 'CLICK', 'LIKE', 'SHARE'];
class UserBehaviorController {
    static async trackInteraction(req, res, next) {
        try {
            const { interaction, page } = req.body;
            if (!interaction || !VALID_INTERACTIONS.includes(interaction.toUpperCase())) {
                res.status(400).json({
                    message: `Invalid or missing interaction. Must be one of: ${VALID_INTERACTIONS.join(', ')}`
                });
                return;
            }
            if (!page) {
                res.status(400).json({ message: 'Page is required' });
                return;
            }
            const device = req.headers['user-agent'] || 'unknown';
            const record = await service_1.userBehaviorService.trackInteraction(interaction.toUpperCase(), page, device);
            res.status(201).json({
                success: true,
                message: `${interaction} recorded successfully`,
                data: record,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserBehaviorController = UserBehaviorController;
