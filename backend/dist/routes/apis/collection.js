"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api = express_1.Router();
api.get("/collection.ts/:collection_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield req.app.locals.db.collection("collections").doc(req.params.collection_id).get();
    if (!doc.exists)
        return res.status(404).json({
            reason: "collection_not_found",
            collection_id: req.params.collection_id
        });
    else
        res.json(doc.data());
}));
exports.default = api;
//# sourceMappingURL=collection.js.map