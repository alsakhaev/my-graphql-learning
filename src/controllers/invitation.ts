import * as invitationService from "../services/invitation";
import { asyncHandler } from "../common/helpers";

export const getMyInvitations = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    if (!namespace || !username) throw new Error('namespace, username are required');
    const data = await invitationService.getInvitations(namespace, username);
    return res.json({ success: true, data });
})

export const invite = asyncHandler(async function (req: any, res: any) {
    const json = req.body;
    if (!json.userFrom || !json.userTo || !json.conferenceId || !json.post || json.is_private === undefined) throw Error('userFrom, userTo, conferenceId, post, is_private are required');
    const id = await invitationService.invite(json.userFrom, json.userTo, json.conferenceId, json.post, json.is_private);
    return res.json({ success: true, data: { id } });
})

export const withdraw = asyncHandler(async function (req: any, res: any) {
    const json = req.body;
    if (!json.userFrom || !json.userTo || !json.conferenceId || !json.post) throw Error('userFrom, userTo, conferenceId, post are required');
    await invitationService.withdraw(json.userFrom, json.userTo, json.conferenceId, json.post);
    return res.json({ success: true });
})

export const setPrivate = asyncHandler(async function (req: any, res: any) {
    const json = req.body;
    if (!json.id || json.is_private === undefined) throw Error('id, is_private are required');
    await invitationService.setPrivate(json.id, json.is_private);
    return res.json({ success: true });
})