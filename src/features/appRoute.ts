import userRoute from './authenetication/routes/auth.route';
import userAuthRoute from './users/user.route';
import blogRoute from './blog/routes/blog.route';
import contentRoute from './contents/routes/content.route';
import leaderboardRoute from './leaderBoard/routes/leaderBoard.route';
import contactRoute from './subscribers/routes/subscriber.route';
import userTaskRoute from './tasks/routes/userTask.route';
import commentRoute from './comments/comment.route';
import likeRoute from './like/like.route';
import taskRoute from './tasks/routes/task.route';
import adminCommentRoute from './admin/routes/comments.Admin'
import adminPostRoute from './admin/routes/post.Admin'
import adminTaskRoute from './admin/routes/task.route'
import adminUserRoute from './admin/routes/usersAdmin'

export default (appRouter :any) => {
  appRouter.use("/users",userRoute);
  appRouter.use("/users/auth",userAuthRoute);
  appRouter.use("/posts",blogRoute);
  appRouter.use("/contents",contentRoute);
  appRouter.use("/leaderborad",leaderboardRoute);
  appRouter.use("/subscribers",contactRoute);
  appRouter.use("/admin",adminPostRoute);
  appRouter.use("/admin",adminUserRoute);
  appRouter.use("/admin",adminTaskRoute);
  appRouter.use("/admin",adminCommentRoute);
  appRouter.use("/tasks",taskRoute);
  appRouter.use("/tasks",userTaskRoute);
  appRouter.use("/coments",commentRoute);
  appRouter.use("/likes",likeRoute);

  return appRouter;
};


