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
const notes = express_1.Router();
notes.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield req.app.locals.db.collection("collections").doc(req.body.coll_id).collection("notes").get();
    if (snapshot.empty)
        return res.status(404).json({
            reason: "no_notes_found",
            coll_id: req.body.coll_id
        });
    else
        res.json(snapshot.docs.map((doc) => doc.id));
}));
notes.get("/:note_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield req.app.locals.db.collection("collections").doc(req.body.coll_id).collection("notes").doc(req.params.note_id).get();
    if (!doc.exists)
        return res.status(404).json({
            reason: "collection_or_note_not_found",
            coll_id: req.body.coll_id,
            note_id: req.params.note_id
        });
    else
        res.json(doc.data());
}));
exports.default = notes;
//# sourceMappingURL=notes.js.map