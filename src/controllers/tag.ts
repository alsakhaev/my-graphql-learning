import * as tagService from "../services/tag";
import { asyncHandler } from "../common/helpers";

export const get = asyncHandler(async function (req: any, res: any) {
    const { teamId } = req.query;
    const tags = await tagService.getTags(teamId);
    return res.json({ success: true, data: tags });
})

export const tag = asyncHandler(async function (req: any, res: any) {
    const json = req.body;
    if (!json.tag_id || !json.item_id || !json.user) throw Error('tag_id, item_id, user are required');
    await tagService.tag(json.item_id, json.tag_id, json.user);
    return res.json({ success: true });
})

export const untag = asyncHandler(async function (req: any, res: any) {
    const json = req.body;
    if (!json.tag_id || !json.item_id || !json.user) throw Error('tag_id, item_id, user are required');
    await tagService.untag(json.item_id, json.tag_id, json.user);
    return res.json({ success: true });
})