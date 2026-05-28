"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4201',
    maxImportFileSizeMb: Number(process.env.MAX_IMPORT_FILE_SIZE_MB ?? 10),
}));
//# sourceMappingURL=app.config.js.map