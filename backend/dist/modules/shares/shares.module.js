"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharesModule = void 0;
const common_1 = require("@nestjs/common");
const shares_controller_1 = require("./shares.controller");
const shares_service_1 = require("./shares.service");
const prisma_module_1 = require("../../integrations/prisma/prisma.module");
const document_access_service_1 = require("../../common/services/document-access.service");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
let SharesModule = class SharesModule {
};
exports.SharesModule = SharesModule;
exports.SharesModule = SharesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [shares_controller_1.SharesController],
        providers: [shares_service_1.SharesService, document_access_service_1.DocumentAccessService, document_role_guard_1.DocumentRoleGuard],
    })
], SharesModule);
//# sourceMappingURL=shares.module.js.map