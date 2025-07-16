"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../dashboard/dashboard.controller.");
const router = (0, express_1.Router)();
router.get('/summary', dashboard_controller_1.getDashboardSummary);
exports.default = router;
