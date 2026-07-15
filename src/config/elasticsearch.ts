import { Client } from "@elastic/elasticsearch";
import { env } from "./env.js";

const elasticsearchClient = new Client({
    node: env.elasticsearch.url,
    ...(env.elasticsearch.username && env.elasticsearch.password
        ? {
              auth: {
                  username: env.elasticsearch.username,
                  password: env.elasticsearch.password,
              },
          }
        : {}),
    ...(env.elasticsearch.apiKey
        ? { auth: { apiKey: env.elasticsearch.apiKey } }
        : {}),
});

export default elasticsearchClient;
