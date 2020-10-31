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
const collections = express_1.Router();
collections.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield req.app.locals.db.collection("collections").doc(req.params.id).get();
    if (!doc.exists)
        return res.status(404).json({
            reason: "collection_not_found",
            id: req.params.id
        });
    else
        res.json(doc.data());
}));
collections.get("/:id/delete", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ref = req.app.locals.db.collection("collections").doc(req.params.id);
    if (!(yield ref.get()).exists)
        return res.status(404).json({
            reason: "collection_not_found",
            id: req.params.id
        });
    else {
        yield ref.delete();
        res.json({ status: "ok" });
    }
}));
collections.post("/:id/create", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.name)
        return res.status(400).json({
            reason: "name_required_for_creation",
            id: req.params.id
        });
    const data = {
        id: req.params.id,
        name: req.body.name,
        desc: req.body.desc || "No descriptions yet."
    };
    const ref = req.app.locals.db.collection("collections").doc(req.params.id);
    if ((yield ref.get()).exists)
        return res.status(403).json({
            reason: "collection_already_exists",
            collection_id: req.params.id
        });
    else {
        yield ref.set(data);
        res.json(data);
    }
}));
exports.default = collections;
//# sourceMappingURL=collections.js.map