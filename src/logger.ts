import NodeVault from "node-vault";
import {Logging, Log} from '@google-cloud/logging';

let log: Log;
let logging: Logging;

(async () => {
    try {
        return require("../logging.json");
    } catch (e) {
        const vaultClient = NodeVault({endpoint: "https://vault.nush.app"});
        const secretsClient = NodeVault({
            endpoint: "https://vault.nush.app",
            token: (await vaultClient.userpassLogin({
                username: "enotes",
                password: process.env.VAULT_PASSWORD
            })).auth.client_token
        });
        return (await secretsClient.read("apps/data/enotes")).data.data.logging_account;
    }
})().then(cred => {
    logging = new Logging({projectId: 'e-notes-nush', credentials: cred});
    log = logging.log("_Default");
});

export function info(text: string | {}, meta = {}) {
    if (!log) return;
    const metadata = {
        jsonPayload: meta,
        resource: {type: 'global'}
    };
    return log.info(log.entry(metadata, text));
}

export function error(text: string | {}, meta = {}) {
    if (!log) return;
    const metadata = {
        jsonPayload: meta,
        resource: {type: 'global'}
    };
    return log.error(log.entry(metadata, text));
}