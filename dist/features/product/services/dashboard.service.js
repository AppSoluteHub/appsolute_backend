"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../../utils/prisma");
class DashboardService {
    async getDashboardData() {
        const [totalEarnings, totalSales, totalOrders, totalUsers] = await Promise.all([
            prisma_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: "SUCCESS" },
            }),
            prisma_1.prisma.payment.count({
                where: { status: "SUCCESS" },
            }),
            prisma_1.prisma.order.count(),
            prisma_1.prisma.user.count(),
        ]);
        const totalProducts = await prisma_1.prisma.product.count();
        const soldGroup = await prisma_1.prisma.orderItem.groupBy({
            by: ["productId"],
            _count: true,
        });
        const soldProducts = soldGroup.length;
        const unsoldProducts = Math.max(totalProducts - soldProducts, 0);
        const [completed, pending, processing, cancelled, refunded] = await Promise.all([
            prisma_1.prisma.order.count({ where: { status: "COMPLETED" } }),
            prisma_1.prisma.order.count({ where: { status: "PENDING" } }),
            prisma_1.prisma.order.count({ where: { status: "PROCESSING" } }),
            prisma_1.prisma.order.count({ where: { status: "CANCELLED" } }),
            prisma_1.prisma.order.count({ where: { status: "REFUNDED" } }),
        ]);
        const last12Months = Array.from({ length: 12 }, (_, i) => (0, date_fns_1.subMonths)(new Date(), 11 - i));
        const monthlySales = await Promise.all(last12Months.map(async (date) => {
            const start = (0, date_fns_1.startOfMonth)(date);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            const monthSales = await prisma_1.prisma.payment.aggregate({
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
