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
exports.VersionsController = void 0;
const common_1 = require("@nestjs/common");
const versions_service_1 = require("./versions.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const create_version_dto_1 = require("./dto/create-version.dto");
const client_1 = require("@prisma/client");
const document_roles_decorator_1 = require("../../common/decorators/document-roles.decorator");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
const uuid_validation_pipe_1 = require("../../common/pipes/uuid-validation.pipe");
let VersionsController = class VersionsController {
    constructor(versionsService) {
        this.versionsService = versionsService;
    }
    list(user, docId, page, limit, sortBy, sortOrder) {
        return this.versionsService.listVersions(user.userId, docId, page, limit, sortBy, sortOrder);
    }
    create(user, docId, dto) {
        return this.versionsService.createVersion(user.userId, docId, dto);
    }
    get(user, versionId) {
        return this.versionsService.getVersion(user.userId, versionId);
    }
    remove(user, versionId) {
        return this.versionsService.deleteVersion(user.userId, versionId);
    }
    setCurrent(user, versionId) {
        return this.versionsService.setCurrent(user.userId, versionId);
    }
};
exports.VersionsController = VersionsController;
__decorate([
    (0, common_1.Get)('documents/:docId/versions'),
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
], VersionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('documents/:docId/versions'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_version_dto_1.CreateVersionDto]),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('versions/:versionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('versionId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "get", null);
__decorate([
    (0, common_1.Delete)('versions/:versionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('versionId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('versions/:versionId/set-current'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('versionId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "setCurrent", null);
exports.VersionsController = VersionsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [versions_service_1.VersionsService])
], VersionsController);
//# sourceMappingURL=versions.controller.js.map