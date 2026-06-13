import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./common/logger/index.js";

const app = createApp();

app.listen(env.port, () => {
  logger.info(`SyncOps API listening on port ${env.port}`);
});
