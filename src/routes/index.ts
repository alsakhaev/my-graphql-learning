import { Router } from "express";
import * as home from "../controllers/home";
import * as conference from "../controllers/conference";
import * as user from "../controllers/user";
import * as post from "../controllers/post";
import * as invitation from "../controllers/invitation";
import * as tag from "../controllers/tag";
import * as teams from "../controllers/team";

const router = Router();

router.get('/', home.index);

router.get('/conferences', conference.get);
router.get('/conferences/invitations', conference.getWithInvitations);
router.get('/conferences/:id', conference.getById);
router.post('/conferences', conference.post);
router.post('/conferences/attend', conference.attend);
router.post('/conferences/absend', conference.absend);

router.get('/users/:namespace/:username', user.getById);
router.get('/users/attendance/:namespace/:username', user.getUserAttendance);
router.post('/users/stat', user.getStat);
router.put('/users', user.put);
router.post('/users', user.post);
router.get('/users/settings', user.getUserSettings);
router.post('/users/settings', user.setUserSettings);
router.get('/users/teams', user.getTeam);

router.get('/posts', post.get);
router.get('/posts/details', post.getDetailed);
router.get('/posts/invitations', post.getWithInvitations);
router.post('/posts/stat', post.getStat);
router.get('/posts/my-tags', post.getAllWithMyTags);

router.get('/invitations', invitation.getMyInvitations);
router.post('/invitations/invite', invitation.invite);
router.post('/invitations/withdraw', invitation.withdraw);
router.post('/invitations/set-private', invitation.setPrivate);

router.get('/tags', tag.get);
router.post('/tags/tag', tag.tag);
router.post('/tags/untag', tag.untag);

router.post('/teams/create', teams.create);

export default router;