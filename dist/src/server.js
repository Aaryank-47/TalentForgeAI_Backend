import app from './app.js';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
dotenv.config({ path: "src/config/.env" });
const port = Number(process.env.PORT) || 3000;
async function startServer() {
    await connectDatabase();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
startServer().catch((error) => {
    console.error('Failed to start server');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map