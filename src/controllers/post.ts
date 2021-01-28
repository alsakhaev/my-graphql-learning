import * as postService from "../services/post";
import { asyncHandler } from "../common/helpers";

export const get = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    const posts = await postService.getPosts(namespace, username);
    return res.json({ success: true, data: posts });
})

export const getDetailed = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    const posts = await postService.getMyDetailedPosts(namespace, username);
    return res.json({ success: true, data: posts });
})

export const getStat = asyncHandler(async function (req: any, res: any) {
    const params = req.body;
    const data = await postService.getStat(params);
    return res.json({ success: true, data: data });
})

export const getWithInvitations = asyncHandler(async function (req: any, res: any) {
    const { namespace, username } = req.query;
    const data = await postService.getPostsWithInvitations(namespace, username);
    return res.json({ success: true, data: data });
})

export const getAllWithMyTags = asyncHandler(async function (req: any, res: any) {
    const { namespace, username, teamId } = req.query;
    if (!namespace || !username) throw new Error('namespace and username are required');
    const posts = await postService.getAllWithMyTags(namespace, username, teamId);
    return res.json({ success: true, data: posts });
})