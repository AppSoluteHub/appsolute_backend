"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
class DashboardService {
    async getDashboardData() {
        const totalEarnings = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "SUCCESS" },
        });
        const totalSales = await prisma.payment.count({
            where: { status: "SUCCESS" },
        });
        const totalOrders = await prisma.order.count();
        const totalUsers = await prisma.user.count();
        const totalProducts = await prisma.product.count();
        const soldProducts = await prisma.orderItem.count();
        const unsoldProducts = Math.max(totalProducts - soldProducts, 0);
        const [completed, pending, processing, cancelled, refunded] = await Promise.all([
            prisma.order.count({ where: { status: "COMPLETED" } }),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.order.count({ where: { status: "PROCESSING" } }),
            prisma.order.count({ where: { status: "CANCELLED" } }),
            prisma.order.count({ where: { status: "REFUNDED" } }),
        ]);
        const last12Months = Array.from({ length: 12 }, (_, i) => (0, date_fns_1.subMonths)(new Date(), i)).reverse();
        const monthlySales = await Promise.all(last12Months.map(async (date) => {
            const start = (0, date_fns_1.startOfMonth)(date);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            const monthSales = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: "SUCCESS",
                    createdAt: { gte: start, lt: end },
                },
            });
            return {
                month: start.toLocaleString("default", { month: "short" }),
                total: monthSales._sum.amount || 0,
            };
        }));
        return {
            summary: {
                totalEarnings: totalEarnings._sum.amount || 0,
                totalSales,
                totalOrders,
                totalUsers,
            },
            products: {
                all: totalProducts,
                sold: soldProducts,
                unsold: unsoldProducts,
            },
            orders: {
                total: totalOrders,
                completed,
                pending,
                processing,
                cancelled,
                refunded,
            },
            monthlySales,
        };
    }
}
exports.dashboardService = new DashboardService();
