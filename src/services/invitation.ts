import { execute } from '../connection';
import { Conference, Post, Profile } from '../types';
import * as userService from './user';
import * as postService from './post';
import * as conferenceService from './conference';
import e from 'express';

type MyInvitation = {
    to_namespace: string;
    to_username: string;
    to_fullname: string;
    to_img: string;
    conference_id: string;
    conference_name: string;
    conference_short_name: string;
    post_id: string;
    post_text: string;
    author_namespace: string;
    author_username: string;
    author_fullname: string;
    author_img: string;
}

export async function getInvitations(namespace: string, username: string): Promise<MyInvitation[]> {
    const query = `
        SELECT
            i.id as id,
            i.is_private as is_private,
            i.conference_id,
            p.id as post_id,
            i.created as created,
            i.modified as modified,

            u_to.namespace as to_namespace,
            u_to.username as to_username,
            u_to.fullname as to_fullname,
            u_to.img as to_img,
            c.name as conference_name,
            c.short_name as conference_short_name,
            p.text as post_text,
            u_author.namespace as author_namespace,
            u_author.username as author_username,
            u_author.fullname as author_fullname,
            u_author.img as author_img
        FROM invitations as i
        JOIN posts as p ON p.id = i.post_id
        JOIN users as u_to ON u_to.namespace = i.namespace_to AND u_to.username = i.username_to
        JOIN users as u_author ON u_author.namespace = p.namespace AND u_author.username = p.username
        JOIN conferences as c ON c.id = i.conference_id
        WHERE i.namespace_from = $1
            AND i.username_from = $2
            AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
        ORDER BY id DESC
    `;
    const params = [namespace, username];
    return execute(c => c.query(query, params).then(x => x.rows));
}


export async function invite(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post, is_private: boolean): Promise<number> {
    return execute(async (client) => {
        if (!await userService.getUser(userFrom.namespace, userFrom.username)) {
            await userService.createUser(userFrom);
        }

        if (!await userService.getUser(userTo.namespace, userTo.username)) {
            await userService.createUser(userTo);
        }

        if (!await postService.getPost(post.id)) {
            await postService.createPost(post);
        }

        // auto attending
        if (!await conferenceService.isAttended(userFrom, conferenceId)) {
            await conferenceService.attend(userFrom, conferenceId);
        }

        let existingId = null;

        // existance checking
        {
            const values = [userFrom.namespace, userTo.namespace, userFrom.username, userTo.username, conferenceId, post.id]
            const query = `
                SELECT id 
                FROM invitations
                WHERE namespace_from = $1
                    AND namespace_to = $2
                    AND username_from = $3
                    AND username_to = $4
                    AND conference_id = $5
                    AND post_id = $6
            `;

            const result = await client.query(query, values);
            if (result.rowCount > 0) existingId = result.rows[0].id;
        }

        if (existingId) {
            const values = [existingId, is_private, new Date().toISOString()]
            const query = `
                UPDATE invitations
                SET id = DEFAULT, 
                    is_private = $2, 
                    modified = $3
                WHERE id = $1
                RETURNING *;`;

            const result = await client.query(query, values);
            return result.rows[0].id;
        } else {
            const values = [userFrom.namespace, userTo.namespace, userFrom.username, userTo.username, conferenceId, post.id, is_private, new Date().toISOString(), new Date().toISOString()]
            const query = `INSERT INTO invitations(
                id, namespace_from, namespace_to, username_from, username_to, conference_id, post_id, is_private, created, modified
            ) VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`;

            const result = await client.query(query, values);
            return result.rows[0].id;
        }
    });
}

export async function withdraw(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post): Promise<void> {
    return execute(async (client) => {
        if (!await userService.getUser(userFrom.namespace, userFrom.username)) {
            await userService.createUser(userFrom);
        }

        if (!await userService.getUser(userTo.namespace, userTo.username)) {
            await userService.createUser(userTo);
        }

        if (!await postService.getPost(post.id)) {
            await postService.createPost(post);
        }

        const values = [userFrom.namespace, userTo.namespace, userFrom.username, userTo.username, conferenceId, post.id]
        const query = `DELETE FROM invitations WHERE 
            namespace_from = $1
            AND namespace_to = $2
            AND username_from = $3
            AND username_to = $4
            AND conference_id = $5
            AND post_id = $6;`;

        await client.query(query, values);
    });
}

export async function setPrivate(invitationId: number, is_private: boolean) {
    return execute(async (client) => {
        const values = [invitationId, is_private, Date.now()];
        const query = `
            UPDATE invitations
            SET is_private = $2,
                modified = $3
            WHERE id = $1;`;

        await client.query(query, values);
    });
}