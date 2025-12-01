import Router from "express";
import { getAllVideos, VideoController } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getAllVideos)


