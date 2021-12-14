import {Request, Response, Router} from 'express';

import {checkAdmin, checkUser} from "../../utils";
import {getAudit, getAudits, renderAudit} from "../../types/audit";

const audits = Router();

function parsePageData(req: Request, res: Response, next: () => any) {
    let last = req.query.last;
    let ps = req.query.pageSize;
    let dir = req.query.dir;
    let pageSize: number = 16;
    if (last === "undefined" || last === "null") last = undefined;
    if (typeof ps === "string") pageSize = parseInt(ps, 10);
    req.body.last = last;
    req.body.pageSize = pageSize;
    req.body.pageDir = dir;
    next();
}

audits.get("/", checkUser, checkAdmin, parsePageData, async (req, res) => res.json(await getAudits(req.body.last, req.body.pageSize, req.body.pageDir)));
audits.get("/rendered", checkUser, checkAdmin, parsePageData, async (req, res) => res.json((await getAudits(req.body.last, req.body.pageSize, req.body.pageDir)).map(a => renderAudit(a))));
audits.get("/:aid", checkUser, checkAdmin, async (req, res) => res.json(await getAudit(req.params.aid)));

export default audits;