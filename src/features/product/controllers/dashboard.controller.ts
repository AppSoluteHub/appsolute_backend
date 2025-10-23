import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

class DashboardController {
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const data = await dashboardService.getDashboardData();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("Dashboard error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export const dashboardController = new DashboardController();
