"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionsModule = void 0;
const common_1 = require("@nestjs/common");
const versions_controller_1 = require("./versions.controller");
const versions_service_1 = require("./versions.service");
const prisma_module_1 = require("../../integrations/prisma/prisma.module");
const document_access_service_1 = require("../../common/services/document-access.service");
const notifications_module_1 = require("../notifications/notifications.module");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
let VersionsModule = class VersionsModule {
};
exports.VersionsModule = VersionsModule;
exports.VersionsModule = VersionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_module_1.NotificationsModule],
        controllers: [versions_controller_1.VersionsController],
        providers: [versions_service_1.VersionsService, document_access_service_1.DocumentAccessService, document_role_guard_1.DocumentRoleGuard],
        exports: [versions_service_1.VersionsService],
    })
], VersionsModule);
//# sourceMappingURL=versions.module.js.map