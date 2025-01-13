"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_route_1 = __importDefault(require("./authenetication/routes/auth.route"));
const blog_route_1 = __importDefault(require("./blog/routes/blog.route"));
const content_route_1 = __importDefault(require("./contents/routes/content.route"));
const leaderBoard_route_1 = __importDefault(require("./leaderBoard/routes/leaderBoard.route"));
const subscriber_route_1 = __importDefault(require("./subscribers/routes/subscriber.route"));
exports.default = (appRouter) => {
    appRouter.use("/users", auth_route_1.default);
    appRouter.use("/posts", blog_route_1.default);
    appRouter.use("/contents", content_route_1.default);
    appRouter.use("/leaderborad", leaderBoard_route_1.default);
    appRouter.use("/", subscriber_route_1.default);
    return appRouter;
};
