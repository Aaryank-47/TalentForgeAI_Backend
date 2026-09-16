import { Client } from "@opensearch-project/opensearch";
import { env } from "./env.js";

const clientOptions: any = {
    node: env.opensearch.url,
    ssl: {
        rejectUnauthorized: false
    }
};

if (env.opensearch.username && env.opensearch.password) {
    clientOptions.auth = {
        username: env.opensearch.username,
        password: env.opensearch.password
    };
}

const opensearchClient = new Client(clientOptions);

export default opensearchClient;
