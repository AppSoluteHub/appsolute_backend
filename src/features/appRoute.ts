import userRoute from './authenetication/routes/auth.route';
import userPageRoute from './users/user.route';
import blogRoute from './blog/routes/blog.route';
import contentRoute from './contents/routes/content.route';
import leaderboardRoute from './leaderBoard/routes/leaderBoard.route';
import contactRoute from './subscribers/routes/subscriber.route';
import userTaskRoute from './tasks/routes/userTask.route';
import commentRoute from './comments/comment.route';
import dashboardRoute from './dashboard/dashboard.route';
import likeRoute from './like/like.route';
import tagRoute from './tags/tag.route';
import catRoute from './category/cat.route';
import taskRoute from './tasks/routes/task.route'
import adminTagRoute from './admin/routes/tag.admin.route'
import adminCategoryRoute from './admin/routes/category.admin.route'
import adminPostRoute from './admin/routes/post.admin.route'
import adminTaskRoute from './admin/routes/task.admin.route'
import adminUserRoute from './admin/routes/auth.admin.route'
import adminCommentRoute from './admin/routes/comment.admin.route'

export default (appRouter :any) => {
  appRouter.use("/users",userRoute);
  appRouter.use("/userPage",userPageRoute);
  appRouter.use("/posts",blogRoute);
  appRouter.use("/contents",contentRoute);
  appRouter.use("/leaderborad",leaderboardRoute);
  appRouter.use("/subscribers",contactRoute);
  appRouter.use("/admin", userPageRoute);
  appRouter.use("/dashboard",dashboardRoute );
  // appRouter.use("/admin",adminUserRoute);
  // appRouter.use("/admin",adminTaskRoute);
  // appRouter.use("/admin",adminCommentRoute);
  // appRouter.use("/admin",adminTagRoute);
  // appRouter.use("/admin",adminCategoryRoute);
  // appRouter.use("/admin",adminPostRoute);
  appRouter.use("/tasks",taskRoute);
  appRouter.use("/doTasks",userTaskRoute);
  appRouter.use("/coments",commentRoute);
  appRouter.use("/likes",likeRoute);
  appRouter.use("/tags",tagRoute);
  appRouter.use("/categories",catRoute);

  return appRouter;
};


