"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contoller_1 = require("./contoller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const router = express_1.default.Router();
router.get('/question/:number', auth_middleware_1.default, contoller_1.getQuestion);
router.post('/question/:number/attempt', auth_middleware_1.default, contoller_1.postAttempt);
exports.default = router;
