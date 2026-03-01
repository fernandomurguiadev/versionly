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
exports.DraftsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const drafts_service_1 = require("./drafts.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const save_draft_dto_1 = require("./dto/save-draft.dto");
const client_1 = require("@prisma/client");
const document_roles_decorator_1 = require("../../common/decorators/document-roles.decorator");
const document_role_guard_1 = require("../../common/guards/document-role.guard");
const uuid_validation_pipe_1 = require("../../common/pipes/uuid-validation.pipe");
let DraftsController = class DraftsController {
    constructor(draftsService) {
        this.draftsService = draftsService;
    }
    get(user, docId) {
        return this.draftsService.getDraft(user.userId, docId);
    }
    save(user, docId, dto) {
        return this.draftsService.saveDraft(user.userId, docId, dto);
    }
};
exports.DraftsController = DraftsController;
__decorate([
    (0, common_1.Get)('documents/:docId/draft'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    (0, throttler_1.Throttle)({ default: { limit: 2, ttl: 1 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DraftsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)('documents/:docId/draft'),
    (0, common_1.UseGuards)(document_role_guard_1.DocumentRoleGuard),
    (0, document_roles_decorator_1.DocumentRoles)(client_1.DocumentRole.editor),
    (0, throttler_1.Throttle)({ default: { limit: 2, ttl: 1 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('docId', uuid_validation_pipe_1.UuidValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, save_draft_dto_1.SaveDraftDto]),
    __metadata("design:returntype", void 0)
], DraftsController.prototype, "save", null);
exports.DraftsController = DraftsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [drafts_service_1.DraftsService])
], DraftsController);
//# sourceMappingURL=drafts.controller.js.map