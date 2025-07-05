import { Router } from "express";
import { registerUser, loginUser, logoutUser, userProfile , changePassword, updateUserDetails, updateAvatar, updateCoverImage, userChannelDetails, userWatchHistory} from "../controllers/user.controllers.js";
import {upload} from '../middlewares/multer.middleware.js'
import {userAuth} from '../middlewares/auth.middleware.js'





const router = Router();

router.route("/register").post(
    upload.fields([{
        name: "avatar",
        maxCount: 1
    },{
        name: "coverImage",
        maxCount: 1
    }])
    ,
    registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(userAuth , logoutUser)
router.route("/profile").get(userAuth , userProfile)
router.route("/reset-password").patch(userAuth , changePassword);
router.route("/update-info").patch(userAuth , updateUserDetails);
router.route("/update-avatar").patch(userAuth , upload.single("avatar") , updateAvatar)
router.route("/update-coverImage").patch(userAuth , upload.single("coverImage") , updateCoverImage)
router.route("/channel-info/:username").get(userAuth , userChannelDetails);
router.route("/watch-history").get(userAuth , userWatchHistory);

export default router;