"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeModule = void 0;
const common_1 = require("@nestjs/common");
const merge_controller_1 = require("./merge.controller");
const merge_service_1 = require("./merge.service");
const prisma_module_1 = require("../../integrations/prisma/prisma.module");
const document_access_service_1 = require("../../common/services/document-access.service");
const versions_module_1 = require("../versions/versions.module");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
let MergeModule = class MergeModule {
};
exports.MergeModule = MergeModule;
exports.MergeModule = MergeModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, versions_module_1.VersionsModule],
        controllers: [merge_controller_1.MergeController],
        providers: [merge_service_1.MergeService, document_access_service_1.DocumentAccessService, document_role_guard_1.DocumentRoleGuard],
    })
], MergeModule);
//# sourceMappingURL=merge.module.js.map