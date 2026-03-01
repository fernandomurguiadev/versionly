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
exports.WorkspacesController = void 0;
const common_1 = require("@nestjs/common");
const workspaces_service_1 = require("./workspaces.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const create_workspace_dto_1 = require("./dto/create-workspace.dto");
const update_workspace_dto_1 = require("./dto/update-workspace.dto");
const add_member_dto_1 = require("./dto/add-member.dto");
const update_member_role_dto_1 = require("./dto/update-member-role.dto");
const workspace_roles_decorator_1 = require("../../common/decorators/workspace-roles.decorator");
const client_1 = require("@prisma/client");
const workspace_role_guard_1 = require("../../common/guards/workspace-role.guard");
const uuid_validation_pipe_1 = require("../../common/pipes/uuid-validation.pipe");
let WorkspacesController = class WorkspacesController {
    constructor(workspacesService) {
        this.workspacesService = workspacesService;
    }
    list(user, search, page, limit, sortBy, sortOrder) {
        return this.workspacesService.listWorkspaces(user.userId, search, page, limit, sortBy, sortOrder);
    }
    create(user, dto) {
        return this.workspacesService.createWorkspace(user.userId, dto);
    }
    get(user, wsId) {
        return this.workspacesService.getWorkspace(user.userId, wsId);
    }
    update(user, wsId, dto) {
        return this.workspacesService.updateWorkspace(user.userId, wsId, dto);
    }
    delete(user, wsId) {
        return this.workspacesService.deleteWorkspace(user.userId, wsId);
    }
    listMembers(user, wsId, search, page, limit, sortBy, sortOrder) {
        return this.workspacesService.listMembers(user.userId, wsId, search, page, limit, sortBy, sortOrder);
    }
    addMember(user, wsId, dto) {
        return this.workspacesService.addMember(user.userId, wsId, dto);
    }
    updateMember(user, wsId, memberUserId, dto) {
        return this.workspacesService.updateMemberRole(user.userId, wsId, memberUserId, dto);
    }
    removeMember(user, wsId, memberUserId) {
        return this.workspacesService.removeMember(user.userId, wsId, memberUserId);
    }
    activity(user, wsId) {
        return this.workspacesService.activity(user.userId, wsId);
    }
};
exports.WorkspacesController = WorkspacesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_workspace_dto_1.CreateWorkspaceDto]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':wsId'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':wsId'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_workspace_dto_1.UpdateWorkspaceDto]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':wsId'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':wsId/members'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "listMembers", null);
__decorate([
    (0, common_1.Post)(':wsId/members'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_member_dto_1.AddMemberDto]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "addMember", null);
__decorate([
    (0, common_1.Patch)(':wsId/members/:userId'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Param)('userId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_member_role_dto_1.UpdateMemberRoleDto]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "updateMember", null);
__decorate([
    (0, common_1.Delete)(':wsId/members/:userId'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Param)('userId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':wsId/activity'),
    (0, common_1.UseGuards)(workspace_role_guard_1.WorkspaceRoleGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(client_1.WorkspaceRole.viewer, client_1.WorkspaceRole.editor, client_1.WorkspaceRole.admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('wsId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "activity", null);
exports.WorkspacesController = WorkspacesController = __decorate([
    (0, common_1.Controller)('workspaces'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService])
], WorkspacesController);
//# sourceMappingURL=workspaces.controller.js.map