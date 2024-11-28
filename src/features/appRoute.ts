import userRoute from './authenetication/routes/auth.route'
import blogRoute from './blog/routes/blog.route';
import contentRoute from './contents/routes/content.route';
import leaderboardRoute from './leaderBoard/routes/leaderBoard.route';

export default (appRouter :any) => {
  appRouter.use("/users",userRoute);
  appRouter.use("/posts",blogRoute);
  appRouter.use("/contents",contentRoute);
  appRouter.use("/leaderborad",leaderboardRoute);

  return appRouter;
};


