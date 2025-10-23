"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
class DashboardController {
    async getDashboard(req, res) {
        try {
            const data = await dashboard_service_1.dashboardService.getDashboardData();
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            console.error("Dashboard error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}
exports.dashboardController = new DashboardController();
