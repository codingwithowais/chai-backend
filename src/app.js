import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: `${process.env.CORS_ORIGIN}`,
    Credential: true
}))
app.use(express.static('public'));
app.use(express.urlencoded({extended: true , limit: "16kb"}));
app.use(express.json({limit: "16kb"}));



// Router set ups
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import healthcheckRouer from './routes/healthcheck.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'

app.use("/api/v1/users" , userRouter);
app.use("/api/v1/videos" , videoRouter);
app.use("/api/v1/comments" , commentRouter);
app.use("/api/v1/tweets" , tweetRouter);
app.use("/api/v1/likes" , likeRouter)
app.use("/api/v1/playlists" , playlistRouter);
app.use("/api/v1/dashboard" , dashboardRouter)
app.use("/api/v1/healthcheck" , healthcheckRouer)
app.use("/api/v1/subscription" , subscriptionRouter);

// 404 route handler (optional)
app.use((req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    message: "Route not found",
    errors: [],
    data: null
  });
});

import {errorHandler} from './middlewares/error.middleware.js'
app.use(errorHandler);
export {app};