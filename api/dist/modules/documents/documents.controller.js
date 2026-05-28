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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const create_document_dto_1 = require("./dto/create-document.dto");
const update_document_dto_1 = require("./dto/update-document.dto");
const move_document_dto_1 = require("./dto/move-document.dto");
const document_member_dto_1 = require("./dto/document-member.dto");
const client_1 = require("@prisma/client");
const document_roles_decorator_1 = require("../../common/decorators/document-roles.decorator");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
const uuid_validation_pipe_1 = require("../../common/pipes/uuid-validation.pipe");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    list(user, folderId, search, page, limit, sortBy, sortOrder) {
        return this.documentsService.listDocuments(user.userId, folderId, search, page, limit, sortBy, sortOrder);
    }
    create(user, folderId, dto) {
        return this.documentsService.createDocument(user.userId, folderId, dto);
    }
    get(user, docId) {
        return this.documentsService.getDocument(user.userId, docId);
    }
    getContent(user, docId) {
        return this.documentsService.getDocumentContent(user.userId, docId);
    }
    update(user, docId, dto) {
        return this.documentsService.updateDocument(user.userId, docId, dto);
    }
    remove(user, docId, confirm) {
        return this.documentsService.deleteDocument(user.userId, docId, confirm);
    }
    move(user, docId, dto) {
        return this.documentsService.moveDocument(user.userId, docId, dto);
    }
    listMembers(user, docId) {
        return this.documentsService.listMembers(user.userId, docId);
    }
    addMember(user, docId, dto) {
        return this.documentsService.addMember(user.userId, docId, dto);
    }
    updateMember(user, docId, userId, dto) {
        return this.documentsService.updateMember(user.userId, docId, userId, dto);
    }
    removeMember(user, docId, userId) {
        return this.documentsService.removeMember(user.userId, docId, userId);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)('folders/:folderId/documents'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('folderId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('folders/:folderId/documents'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('folderId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_document_dto_1.CreateDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('documents/:docId'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.viewer, client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)('documents/:docId/content'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.viewer, client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getContent", null);
__decorate([
    (0, common_1.Patch)('documents/:docId'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_document_dto_1.UpdateDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('documents/:docId'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Query)('confirm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('documents/:docId/move'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, move_document_dto_1.MoveDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "move", null);
__decorate([
    (0, common_1.Get)('documents/:docId/members'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "listMembers", null);
__decorate([
    (0, common_1.Post)('documents/:docId/members'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, document_member_dto_1.DocumentMemberDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Patch)('documents/:docId/members/:userId'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Param)('userId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, document_member_dto_1.DocumentMemberDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "updateMember", null);
__decorate([
    (0, common_1.Delete)('documents/:docId/members/:userId'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Param)('userId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "removeMember", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map