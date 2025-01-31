import userRoute from './authenetication/routes/auth.route'
import blogRoute from './blog/routes/blog.route';
import contentRoute from './contents/routes/content.route';
import leaderboardRoute from './leaderBoard/routes/leaderBoard.route';
import contactRoute from './subscribers/routes/subscriber.route'
import adminRoute from './admin/routes/manageUser.route'

export default (appRouter :any) => {
  appRouter.use("/users",userRoute);
  appRouter.use("/posts",blogRoute);
  appRouter.use("/contents",contentRoute);
  appRouter.use("/leaderborad",leaderboardRoute);
  appRouter.use("/",contactRoute);
  appRouter.use("/admin",adminRoute);

  return appRouter;
};


