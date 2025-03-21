import express from "express";
import {
  deleteBook,
  getBooks,
  recommendBook,
  uploadBook,
} from "../controllers/bookController.js";
import protectRoute from "../middleware/protectRoute.js";

const bookRouter = express.Router();

bookRouter.post("/upload", protectRoute, uploadBook);
bookRouter.get("/getbook", protectRoute, getBooks);
bookRouter.delete("/delete/:id", protectRoute, deleteBook);
bookRouter.get("/recommend", protectRoute, recommendBook);

export default bookRouter;
