import { asyncHandler } from "../utils/asyncHandler.js";
import { generateRefreshAndAccessToken } from '../controllers/user.controllers.js'
import { ApiError } from '../utils/apiError.js'
import jwt from 'jsonwebtoken'


const userAuth = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    const accessToken = req.cookies?.accessToken;
    if (!refreshToken && !accessToken) {
        throw new ApiError(400, "user unauthorized");
    }
    try {
        const decodedUser = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedUser;
        return next();
    } catch (error) {
        console.log("access token error", error.message);
    }

    try {

        const decodedUser = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const { refreshToken: newRefreshToken, accessToken: newAccessToken } = await generateRefreshAndAccessToken(decodedUser.id);
        const options = {
            httpOnly: true,
            secure: true
        }
        res.cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", newAccessToken, options)

        req.user = decodedUser
        return next();
    } catch (error) {
        console.log("refresh token error", error.message);
        throw new ApiError(400, "tokens expired! Please log in again");
    }
})

export { userAuth };