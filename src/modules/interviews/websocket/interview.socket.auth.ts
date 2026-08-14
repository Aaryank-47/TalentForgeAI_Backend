import type { Socket } from "socket.io";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";

export function socketAuthMiddleware(
    socket: Socket,
    next: (err?: Error) => void
) {
    try {
        const token = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization;

        if (!token || typeof token !== "string") {
            return next(new Error("Authentication error : Token is required and must be a string"));
        }

        let cleanToken = token;
        if (token.startsWith("Bearer ")) {
            cleanToken = token.substring(7).trim();
        } else if (token.startsWith("Bearer")) {
            return next(new Error("Authentication error : Malformed Authorization header format"));
        }

        if (!cleanToken) {
            return next(new Error("Authentication error : Token is empty"));
        }

        const decodedToken = JwtHelper.verifyAccessToken(cleanToken);

        socket.user = decodedToken;
        socket.data.user = decodedToken;
        return next();
        // Optional : validate company membership
        // Fetch company member and attach to socket
        

    }
    catch (error: any) {
        if(error.name === "TokenExpiredError"){
            return next(new Error("Authentication error : Token expired"));
        }
        return next(new Error("Authentication error : Invalid token"));
    }
}