import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄 chat service",
  });
});
export default router;