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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const document_access_service_1 = require("../services/document-access.service");
const document_roles_decorator_1 = require("../decorators/document-roles.decorator");
let DocumentRoleGuard = class DocumentRoleGuard {
    constructor(reflector, documentAccess) {
        this.reflector = reflector;
        this.documentAccess = documentAccess;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(document_roles_decorator_1.DOCUMENT_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context
            .switchToHttp()
            .getRequest();
        const userId = request.user?.userId;
        const docId = request.params?.docId ?? request.params?.documentId;
        if (!userId || !docId) {
            throw new common_1.ForbiddenException('No tienes acceso al documento.');
        }
        const access = await this.documentAccess.getAccess(userId, docId);
        request.user = { userId, documentRole: access.role };
        if (!requiredRoles.includes(access.role)) {
            throw new common_1.ForbiddenException('No tienes permisos suficientes.');
        }
        return true;
    }
};
exports.DocumentRoleGuard = DocumentRoleGuard;
exports.DocumentRoleGuard = DocumentRoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        document_access_service_1.DocumentAccessService])
], DocumentRoleGuard);
//# sourceMappingURL=document-role.guard.js.map