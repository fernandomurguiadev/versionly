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
exports.SharesController = void 0;
const common_1 = require("@nestjs/common");
const shares_service_1 = require("./shares.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const create_share_dto_1 = require("./dto/create-share.dto");
const client_1 = require("@prisma/client");
const document_roles_decorator_1 = require("../../common/decorators/document-roles.decorator");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
const uuid_validation_pipe_1 = require("../../common/pipes/uuid-validation.pipe");
let SharesController = class SharesController {
    constructor(sharesService) {
        this.sharesService = sharesService;
    }
    resolve(token, request) {
        const forwarded = request.headers['x-forwarded-for'];
        const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        return this.sharesService.resolve(token, {
            ipAddress: ip ?? request.ip ?? 'unknown',
            userAgent: request.headers['user-agent'] ?? null,
        });
    }
    list(user, docId, page, limit, sortBy, sortOrder) {
        return this.sharesService.list(docId, user.userId, page, limit, sortBy, sortOrder);
    }
    create(user, docId, dto) {
        return this.sharesService.create(docId, user.userId, dto);
    }
    revoke(user, shareId) {
        return this.sharesService.revoke(shareId, user.userId);
    }
};
exports.SharesController = SharesController;
__decorate([
    (0, common_1.Get)('public/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "resolve", null);
__decorate([
    (0, common_1.Get)('documents/:docId/shares'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('documents/:docId/shares'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_share_dto_1.CreateShareDto]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)('shares/:shareId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('shareId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "revoke", null);
exports.SharesController = SharesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [shares_service_1.SharesService])
], SharesController);
//# sourceMappingURL=shares.controller.js.map