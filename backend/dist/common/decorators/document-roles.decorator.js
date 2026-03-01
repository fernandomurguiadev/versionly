"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRoles = exports.DOCUMENT_ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.DOCUMENT_ROLES_KEY = 'document_roles';
const DocumentRoles = (...roles) => (0, common_1.SetMetadata)(exports.DOCUMENT_ROLES_KEY, roles);
exports.DocumentRoles = DocumentRoles;
//# sourceMappingURL=document-roles.decorator.js.map