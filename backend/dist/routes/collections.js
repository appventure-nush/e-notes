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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notes_1 = __importDefault(require("./notes"));
const collections = express_1.Router();
collections.get("/:coll_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield req.app.locals.db.collection("collections").doc(req.params.coll_id).get();
    if (!doc.exists)
        return res.status(404).json({
            reason: "collection_not_found",
            coll_id: req.params.coll_id
        });
    else
        res.json(doc.data());
}));
collections.delete("/:coll_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ref = req.app.locals.db.collection("collections").doc(req.params.coll_id);
    if (!(yield ref.get()).exists)
        return res.status(404).json({
            reason: "collection_not_found",
            coll_id: req.params.coll_id
        });
    else {
        yield ref.delete();
        res.json({ status: "ok" });
    }
}));
collections.post("/:coll_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        coll_id: req.params.coll_id,
        name: req.body.name || req.params.coll_id,
        desc: req.body.desc || "No descriptions yet."
    };
    const ref = req.app.locals.db.collection("collections").doc(req.params.coll_id);
    if ((yield ref.get()).exists)
        return res.status(403).json({
            reason: "collection_already_exists",
            coll_id: req.params.coll_id
        });
    else {
        yield ref.set(data);
        res.json(data);
    }
}));
collections.use("/:coll_id/notes", (req, res, next) => {
    req.body.coll_id = req.params.coll_id;
    next();
}, notes_1.default);
exports.default = collections;
//# sourceMappingURL=collections.js.map