"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_route_1 = __importDefault(require("./authenetication/routes/auth.route"));
const user_route_1 = __importDefault(require("./users/user.route"));
const blog_route_1 = __importDefault(require("./blog/routes/blog.route"));
const content_route_1 = __importDefault(require("./contents/routes/content.route"));
const leaderBoard_route_1 = __importDefault(require("./leaderBoard/routes/leaderBoard.route"));
const subscriber_route_1 = __importDefault(require("./subscribers/routes/subscriber.route"));
const userTask_route_1 = __importDefault(require("./tasks/routes/userTask.route"));
const comment_route_1 = __importDefault(require("./comments/comment.route"));
const like_route_1 = __importDefault(require("./like/like.route"));
const task_route_1 = __importDefault(require("./tasks/routes/task.route"));
// import adminCommentRoute from './admin/routes/comments.Admin'
// import adminPostRoute from './admin/routes/post.Admin'
// import adminTaskRoute from './admin/routes/task.route'
// import adminUserRoute from './admin/routes/usersAdmin'
exports.default = (appRouter) => {
    appRouter.use("/users", auth_route_1.default);
    appRouter.use("/userPage", user_route_1.default);
    appRouter.use("/posts", blog_route_1.default);
    appRouter.use("/contents", content_route_1.default);
    appRouter.use("/leaderborad", leaderBoard_route_1.default);
    appRouter.use("/subscribers", subscriber_route_1.default);
    // appRouter.use("/admin",adminPostRoute);
    // appRouter.use("/admin",adminUserRoute);
    // appRouter.use("/admin",adminTaskRoute);
    // appRouter.use("/admin",adminCommentRoute);
    appRouter.use("/tasks", task_route_1.default);
    appRouter.use("/tasks", userTask_route_1.default);
    appRouter.use("/coments", comment_route_1.default);
    appRouter.use("/likes", like_route_1.default);
    return appRouter;
};
