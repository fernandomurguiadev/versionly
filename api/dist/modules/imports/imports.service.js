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
exports.ImportsService = void 0;
const common_1 = require("@nestjs/common");
const documents_service_1 = require("../documents/documents.service");
const versions_service_1 = require("../versions/versions.service");
const EMPTY_DOC = { type: 'doc', content: [] };
let ImportsService = class ImportsService {
    constructor(documentsService, versionsService) {
        this.documentsService = documentsService;
        this.versionsService = versionsService;
    }
    async importDocument(userId, folderId, dto) {
        const { content, warnings } = this.parseContent(dto);
        const title = dto.title?.trim() || this.suggestTitle(dto.filename);
        const document = await this.documentsService.createDocument(userId, folderId, { title });
        if (!document) {
            throw new common_1.BadRequestException('No se pudo crear el documento.');
        }
        const version = await this.versionsService.createImportVersion(userId, document.id, {
            name: 'Importación inicial',
            comment: `Importado desde ${dto.filename}`,
            content,
            importWarnings: warnings,
            markAsCurrent: true,
        });
        return {
            documentId: document.id,
            versionId: version.id,
            warnings,
        };
    }
    parseContent(dto) {
        const warnings = [];
        const buffer = Buffer.from(dto.contentBase64, 'base64');
        if (buffer.length === 0) {
            throw new common_1.BadRequestException('Archivo vacío.');
        }
        const contentText = buffer.toString('utf8');
        if (dto.mimeType === 'application/json' || dto.filename.toLowerCase().endsWith('.json')) {
            try {
                const parsed = JSON.parse(contentText);
                return {
                    content: typeof parsed === 'object' && parsed ? parsed : EMPTY_DOC,
                    warnings,
                };
            }
            catch (error) {
                warnings.push({ code: 'INVALID_JSON', message: 'No se pudo interpretar el JSON.' });
            }
        }
        warnings.push({ code: 'IMPORT_PLACEHOLDER', message: 'Contenido convertido de forma básica.' });
        return {
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: contentText.slice(0, 2000),
                            },
                        ],
                    },
                ],
            },
            warnings,
        };
    }
    suggestTitle(filename) {
        const stripped = filename.replace(/\.[^/.]+$/, '').trim();
        return stripped || 'Documento importado';
    }
};
exports.ImportsService = ImportsService;
exports.ImportsService = ImportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService,
        versions_service_1.VersionsService])
], ImportsService);
//# sourceMappingURL=imports.service.js.map