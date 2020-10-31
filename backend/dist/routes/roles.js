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
const roles = express_1.Router();
roles.get("/:role_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield req.app.locals.db.collection("roles").doc(req.params.role_id).get();
    if (!doc.exists)
        return res.status(404).json({
            reason: "role_not_found",
            role_id: req.params.role_id
        });
    else
        res.json(doc.data());
}));
roles.delete("/:role_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ref = req.app.locals.db.collection("roles").doc(req.params.role_id);
    if (!(yield ref.get()).exists)
        return res.status(404).json({
            reason: "role_not_found",
            role_id: req.params.role_id
        });
    else {
        yield ref.delete();
        res.json({ status: "ok" });
    }
}));
roles.post("/:role_id/create", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.name)
        return res.status(400).json({
            reason: "name_required_for_creation",
            role_id: req.params.role_id
        });
    const data = {
        role_id: req.params.role_id,
        name: req.body.name || req.params.role_id,
        desc: req.body.desc || "No descriptions yet.",
        permissions: req.body.permissions || []
    };
    const ref = req.app.locals.db.collection("roles").doc(req.params.role_id);
    if ((yield ref.get()).exists)
        return res.status(403).json({
            reason: "role_already_exists",
            role_id: req.params.role_id
        });
    else {
        yield ref.set(data);
        res.json(data);
    }
}));
exports.default = roles;
//# sourceMappingURL=roles.js.map