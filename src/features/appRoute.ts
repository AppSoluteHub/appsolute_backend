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
import userBahaviourRoutes from './behaviour/route';

export default (appRouter :any) => {
  appRouter.use("/users",userRoute);
  appRouter.use("/userPage",userPageRoute);
  appRouter.use("/posts",blogRoute);
  appRouter.use("/contents",contentRoute);
  appRouter.use("/leaderborad",leaderboardRoute);
  appRouter.use("/subscribers",contactRoute);
  appRouter.use("/admin", userPageRoute);
  appRouter.use("/dashboard",dashboardRoute );
  appRouter.use("/bahaviour", userBahaviourRoutes );
  appRouter.use("/tasks",taskRoute);
  appRouter.use("/doTasks",userTaskRoute);
  appRouter.use("/coments",commentRoute);
  appRouter.use("/likes",likeRoute);
  appRouter.use("/tags",tagRoute);
  appRouter.use("/categories",catRoute);

  return appRouter;
};


