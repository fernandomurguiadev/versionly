"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let ApiThrottlerGuard = class ApiThrottlerGuard extends throttler_1.ThrottlerGuard {
    async getTracker(req) {
        const user = req['user'];
        if (user?.userId) {
            return `user:${user.userId}`;
        }
        const ip = req.ip;
        const forwarded = req.headers?.['x-forwarded-for'];
        const resolved = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        return `ip:${resolved ?? ip ?? 'unknown'}`;
    }
    getLimit(context) {
        const request = context.switchToHttp().getRequest();
        return request.user?.userId ? 300 : 100;
    }
    getTtl(context) {
        context.switchToHttp();
        return 60;
    }
};
exports.ApiThrottlerGuard = ApiThrottlerGuard;
exports.ApiThrottlerGuard = ApiThrottlerGuard = __decorate([
    (0, common_1.Injectable)()
], ApiThrottlerGuard);
//# sourceMappingURL=api-throttler.guard.js.map