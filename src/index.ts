import express from "express";

import setupSwagger from "./swagger/swagger";

const app = express();

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on :${PORT}`);
});
export default app;
