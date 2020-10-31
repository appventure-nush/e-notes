"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collections_1 = __importDefault(require("./collections"));
const api = express_1.Router();
api.use("/collections", collections_1.default);
exports.default = api;
//# sourceMappingURL=api.js.map