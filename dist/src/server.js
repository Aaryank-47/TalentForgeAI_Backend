import app from './app.js';
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDatabase } from './config/database.js';
import env from './config/env.js';
import { ElasticsearchService } from './modules/company/services/elasticsearch.service.js';
import { initializeInterviewSocket } from './modules/interviews/websocket/interview.socket.js';
const port = env.port;
// Create HTTP server using Express
const httpServer = createServer(app);
async function startServer() {
    await connectDatabase();
    await ElasticsearchService.ensureIndex();
    // Start the HTTP + Socket.IO server
    httpServer.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
}
const io = new Server(httpServer, {
    cors: {
        origin: env.app.frontendUrl,
        credentials: true
    }
});
initializeInterviewSocket(io);
startServer().catch((error) => {
    console.error('Failed to start server');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map