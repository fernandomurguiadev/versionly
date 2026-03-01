"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const assets_service_1 = require("./assets.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const upload_asset_dto_1 = require("./dto/upload-asset.dto");
const client_1 = require("@prisma/client");
const document_roles_decorator_1 = require("../../common/decorators/document-roles.decorator");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
const uuid_validation_pipe_1 = require("../../common/pipes/uuid-validation.pipe");
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    list(user, docId, page, limit, sortBy, sortOrder) {
        return this.assetsService.list(user.userId, docId, page, limit, sortBy, sortOrder);
    }
    upload(user, docId, dto) {
        return this.assetsService.upload(user.userId, docId, dto);
    }
    remove(user, assetId) {
        return this.assetsService.remove(user.userId, assetId);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)('documents/:docId/assets'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.viewer, client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('documents/:docId/assets'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, upload_asset_dto_1.UploadAssetDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)('assets/:assetId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('assetId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "remove", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map