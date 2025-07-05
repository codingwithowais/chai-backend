import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controllers.js"
import {userAuth} from "../middlewares/auth.middleware.js"


const router = Router();

router.use(userAuth); // Apply userAuth middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router