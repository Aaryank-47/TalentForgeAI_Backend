import app from './app.js';
import { connectDatabase } from './config/database.js';
import env from './config/env.js';
import { ElasticsearchService } from './modules/company/services/elasticsearch.service.js';
const port = env.port;
async function startServer() {
    await connectDatabase();
    await ElasticsearchService.ensureIndex();
    app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
}
startServer().catch((error) => {
    console.error('Failed to start server');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map