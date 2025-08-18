import  Router  from "express";
import { loginUser, registerUser, logoutUser, refereshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, userAvatarUpdate, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.contoller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const  router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/regresh-token").post(refereshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), userAvatarUpdate )

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router