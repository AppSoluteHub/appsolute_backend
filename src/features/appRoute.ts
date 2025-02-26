import userRoute from './authenetication/routes/auth.route';
import userAuthRoute from './users/user.route';
import blogRoute from './blog/routes/blog.route';
import contentRoute from './contents/routes/content.route';
import leaderboardRoute from './leaderBoard/routes/leaderBoard.route';
import contactRoute from './subscribers/routes/subscriber.route';
import adminRoute from './admin/routes/manageUser.route';
import userTaskRoute from './tasks/routes/userTask.route';
import commentRoute from './comments/comment.route';
import taskRoute from './tasks/routes/task.route';

export default (appRouter :any) => {
  appRouter.use("/users",userRoute);
  appRouter.use("/users/auth",userAuthRoute);
  appRouter.use("/posts",blogRoute);
  appRouter.use("/contents",contentRoute);
  appRouter.use("/leaderborad",leaderboardRoute);
  appRouter.use("/subscribers",contactRoute);
  appRouter.use("/admin",adminRoute);
  appRouter.use("/tasks",taskRoute);
  appRouter.use("/tasks",userTaskRoute);
  appRouter.use("/coments",commentRoute);

  return appRouter;
};


