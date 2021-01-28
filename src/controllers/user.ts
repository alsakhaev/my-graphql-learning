import * as userService from "../services/user";
import { asyncHandler } from "../common/helpers";

export const getById = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.params;
    const user = await userService.getUser(namespace, username);
    return res.json({ success: true, data: user });
})

export const post = asyncHandler(async function (req: any, res: any) {
    const user = req.body;
    const conf = await userService.createUser(user);
    return res.json({ success: true, data: conf });
})

export const put = asyncHandler(async function (req: any, res: any) {
    const user = req.body;
    const conf = await userService.updateUser(user);
    return res.json({ success: true, data: conf });
})

export const getUserAttendance = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.params;
    const badge = await userService.getUserAttendance(namespace, username);
    return res.json({ success: true, data: badge });
})

export const getStat = asyncHandler(async function (req: any, res: any) {
    const params = req.body;
    const data = await userService.getStat(params);
    return res.json({ success: true, data: data });
})

export const getUserSettings = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    const data = await userService.getUserSettings(namespace, username);
    return res.json({ success: true, data });
})

export const setUserSettings = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    const settings = req.body;
    await userService.setUserSettings(namespace, username, settings);
    return res.json({ success: true });
})

export const getTeam = asyncHandler(async function (req: any, res: any) {
    const { id } = req.query;
    const data = await userService.getTeam(id);
    return res.json({ success: true, data });
})