"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_config_1 = require("./config/app.config");
const database_config_1 = require("./config/database.config");
const jwt_config_1 = require("./config/jwt.config");
const redis_config_1 = require("./config/redis.config");
const storage_config_1 = require("./config/storage.config");
const prisma_module_1 = require("./integrations/prisma/prisma.module");
const redis_module_1 = require("./integrations/redis/redis.module");
const throttler_1 = require("@nestjs/throttler");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const workspaces_module_1 = require("./modules/workspaces/workspaces.module");
const projects_module_1 = require("./modules/projects/projects.module");
const folders_module_1 = require("./modules/folders/folders.module");
const invitations_module_1 = require("./modules/invitations/invitations.module");
const documents_module_1 = require("./modules/documents/documents.module");
const drafts_module_1 = require("./modules/drafts/drafts.module");
const versions_module_1 = require("./modules/versions/versions.module");
const diff_module_1 = require("./modules/diff/diff.module");
const merge_module_1 = require("./modules/merge/merge.module");
const shares_module_1 = require("./modules/shares/shares.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const imports_module_1 = require("./modules/imports/imports.module");
const assets_module_1 = require("./modules/assets/assets.module");
const api_throttler_guard_1 = require("./common/guards/api-throttler.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, jwt_config_1.default, redis_config_1.default, storage_config_1.default],
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60,
                    limit: 300,
                },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
            projects_module_1.ProjectsModule,
            folders_module_1.FoldersModule,
            invitations_module_1.InvitationsModule,
            documents_module_1.DocumentsModule,
            drafts_module_1.DraftsModule,
            versions_module_1.VersionsModule,
            diff_module_1.DiffModule,
            merge_module_1.MergeModule,
            shares_module_1.SharesModule,
            notifications_module_1.NotificationsModule,
            imports_module_1.ImportsModule,
            assets_module_1.AssetsModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: api_throttler_guard_1.ApiThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map