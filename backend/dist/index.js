"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const bodyParser = __importStar(require("body-parser"));
// @ts-ignore
const node_vault_1 = __importDefault(require("node-vault"));
const api_1 = __importDefault(require("./routes/api"));
const app = express_1.default();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use("/api", api_1.default);
app.get("/", (req, res) => res.send("API End Point: /api"));
// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
// set up firebase admin with vault
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return require("service-account.json");
    }
    catch (e) {
        const vaultClient = node_vault_1.default({ endpoint: "https://vault.nush.app" });
        const secretsClient = node_vault_1.default({
            endpoint: "https://vault.nush.app",
            token: (yield vaultClient.userpassLogin({
                username: "enotes",
                password: process.env.VAULT_PASSWORD
            })).auth.client_token
        });
        return (yield secretsClient.read("apps/data/enotes")).data.data.service_account;
    }
}))().then((serviceAccount) => {
    firebase_admin_1.default.initializeApp({ credential: firebase_admin_1.default.credential.cert(serviceAccount) });
    app.locals.db = firebase_admin_1.default.firestore();
});
//# sourceMappingURL=index.js.map