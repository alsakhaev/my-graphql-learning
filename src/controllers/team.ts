import * as teamService from "../services/team";
import { asyncHandler } from "../common/helpers";

export const create = asyncHandler(async function (req: any, res: any) {
    const data = req.body;
    const team = await teamService.createTeam(data);
    return res.json({ success: true, data: team });
})