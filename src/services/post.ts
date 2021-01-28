import { execute } from '../connection';
import { Post } from '../types';
import { pg as named } from 'yesql';

type DetailedPost = {
    id: string;
    text: string;
    author_namespace: string;
    author_username: string;
    author_img: string;
    conference_id: number;
    conference_name: string;
    conference_short_name: string;
    user_from_namespace: string;
    user_from_username: string;
    user_from_fullname: string;
    user_to_namespace: string;
    user_to_username: string;
    user_to_fullname: string;
}

type PostWithInvitations = {
    post: {
        id: string;
        namespace: string;
        username: string;
        fullname: string;
        img: string;
        text: string;
    };
    conferences: {
        id: number;
        name: string;
        short_name: string;
        users: {
            namespace: string;
            username: string;
            fullname: string;
            is_private: boolean;
        }[];
    }[];
}

type PostWithTags = {
    id: string;
    namespace: string;
    username: string;
    fullname: string;
    img: string;
    text: string;
    tags: { id: string, name: string, value: boolean, created: string, modified: string }[];
}

export async function getPosts(namespace?: string, username?: string): Promise<Post[]> {
    if (!namespace !== !username) throw new Error('namespace and username are required');

    const isFilter = namespace && username;
    const params = (isFilter) ? [namespace, username] : undefined;
    const query = `
        SELECT
            p.id,
            p.text,
            u.namespace,
            u.username,
            u.fullname,
            u.img,
            u.main_conference_id
        FROM posts as p 
        JOIN users as u on u.namespace = p.namespace
            AND u.username = p.username
        ${isFilter ? `WHERE (
            SELECT COUNT(*)
            FROM invitations as i 
            JOIN conferences as c on c.id = i.conference_id
            WHERE i.post_id = p.id
                AND (c.date_to >= DATE(NOW() - INTERVAL '3 DAY'))
                AND ((i.namespace_from = $1 AND i.username_from = $2)
                    OR (i.namespace_to = $1 AND i.username_to = $2))
        ) <> 0`: ''}
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}

export async function getPost(id: string): Promise<Post[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM posts WHERE id = $1;', [id]);
        return res.rows[0];
    });
}

export async function createPost(u: Post): Promise<Post> {
    return execute(async (client) => {
        const entries = Object.entries(u);
        const values = entries.map(x => x[1]);

        const fields = entries.map(x => x[0]).join(', '); // name, short_name, date_from, date_to
        const variables = entries.map((_, i) => '$' + (i + 1)).join(', '); // $1, $2, $3, $4
        const query = `INSERT INTO posts(${fields}) VALUES (${variables}) RETURNING *;`;

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function getMyDetailedPosts(namespace: string, username: string): Promise<DetailedPost[]> {
    if (!namespace || !username) throw new Error('namespace and username are required');

    const params = [namespace, username];
    const query = `
        SELECT
            p.id,
            p.text,
            u_author.namespace AS author_namespace,
            u_author.username AS author_username,
            u_author.fullname AS author_fullname,
            u_author.img AS author_img,
            c.id AS conference_id,
            c.name AS conference_name,
            c.short_name AS conference_short_name,
            u_from.namespace AS user_from_namespace,
            u_from.username AS user_from_username,
            u_from.fullname AS user_from_fullname,
            u_to.namespace AS user_to_namespace,
            u_to.username AS user_to_username,
            u_to.fullname AS user_to_fullname
        FROM invitations AS i
        LEFT JOIN posts AS p ON p.id = i.post_id
        LEFT JOIN conferences AS c ON c.id = i.conference_id
        LEFT JOIN users AS u_author ON u_author.namespace = p.namespace AND u_author.username = p.username
        LEFT JOIN users AS u_from ON u_from.namespace = i.namespace_from AND u_from.username = i.username_from
        LEFT JOIN users AS u_to ON u_to.namespace = i.namespace_to AND u_to.username = i.username_to
        WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
            AND ((i.namespace_from = $1 AND i.username_from = $2)
            OR (i.namespace_to = $1 AND i.username_to = $2))
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}

export async function getStat(filters?: { username?: string, limit?: number, teamId?: string }): Promise<any[]> {

    const query = `
        SELECT *
        FROM (
            SELECT
                p.*,
                u.fullname,
                u.img,

                (
                    SELECT COUNT(*) 
                    FROM invitations AS i 
                    JOIN conferences AS c on c.id = i.conference_id 
                    WHERE i.post_id = p.id 
                        AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                ) AS invitations_count,

                (
                    SELECT COUNT(*) 
                    FROM (
                        SELECT conference_id 
                        FROM invitations AS i 
                        JOIN conferences AS c ON c.id = i.conference_id
                        WHERE i.post_id = p.id
                            AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                        GROUP BY i.conference_id
                    ) AS x
                ) AS conferences_count,

                (
                    SELECT COUNT(*) 
                    FROM (
                        (
                            SELECT i.namespace_to, i.username_to 
                            FROM invitations AS i 
                            JOIN conferences AS c ON c.id = i.conference_id
                            WHERE i.post_id = p.id
                                AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                            GROUP BY i.namespace_to, i.username_to
                        ) UNION ALL (
                            SELECT i.namespace_from, i.username_from
                            FROM invitations AS i 
                            JOIN conferences AS c ON c.id = i.conference_id
                            WHERE i.post_id = p.id
                                AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                            GROUP BY i.namespace_from, i.username_from
                        )
                    ) AS x
                ) AS discussed_by

                ${(filters?.teamId) ? `
                    ,(
                        SELECT COUNT(*)
                        FROM (
                            SELECT it.namespace, it.username
                            FROM itemtags as it
                            JOIN tags as t on t.id = it.tag_id
                            WHERE t.team_id = :teamId
                                AND it.item_id = p.id
                                AND it.value IS TRUE
                            GROUP BY it.namespace, it.username
                        ) AS x
                    ) AS team_rating
                `: ''}

            FROM posts AS p
            LEFT JOIN users AS u ON u.namespace = p.namespace
                AND u.username = p.username
            WHERE p.id IN (
                select i.post_id
                from invitations as i
                join conferences as c on c.id = i.conference_id
                where c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
            )
            ${filters?.username ? 'AND p.username = :username' : ''}
        ) AS main
        ${(filters?.teamId) ? `ORDER BY main.team_rating DESC` : `ORDER BY main.discussed_by DESC`}
        LIMIT :limit
    `;

    const params = {
        limit: filters?.limit ?? 100,
        username: filters?.username,
        teamId: filters?.teamId
    };

    const data = await execute(c => c.query(named(query)(params)).then(r => r.rows));

    data.forEach(d => {
        d.invitations_count = parseInt(d.invitations_count);
        d.conferences_count = parseInt(d.conferences_count);
        d.discussed_by = parseInt(d.discussed_by);
        if (d.team_rating !== undefined) d.team_rating = parseInt(d.team_rating);
    });

    return data;
}

export async function getPostsWithInvitations(namespace: string, username: string): Promise<PostWithInvitations[]> {
    if (!namespace || !username) throw new Error('namespace and username are required');

    const params = [namespace, username];
    const query = `
        select post, conferences
        from (
            select 
                json_build_object(
                    'id', p.id,
                    'namespace', p.namespace,
                    'username', p.username,
                    'fullname', u.fullname,
                    'img', u.img,
                    'text', p.text
                ) as post,
                (
                    select json_agg(json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'short_name', c.short_name,
                        'invitations', (              
                            select 
                                json_agg(json_build_object(
                                    'id', ii.id,
                                    'namespace_from', ii.namespace_from,
                                    'username_from', ii.username_from,
                                    'fullname_from', uu_from.fullname,
                                    'namespace_to', ii.namespace_to,
                                    'username_to', ii.username_to,
                                    'fullname_to', uu_to.fullname,
                                    'is_private', ii.is_private
                                ))
                            from invitations as ii 
                            join users as uu_from on uu_from.namespace = ii.namespace_from and uu_from.username = ii.username_from
                            join users as uu_to on uu_to.namespace = ii.namespace_to and uu_to.username = ii.username_to
                            join conferences as cc on cc.id = ii.conference_id
                            WHERE ii.post_id = p.id
                                and cc.id = c.id
                        )
                    ))
                    from conferences as c 
                    where c.id in (
                        select i.conference_id 
                        from invitations as i 
                        where i.post_id = p.id
                    ) and c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                ) as conferences,
                (
                    select max(modified)
                    from invitations as iii
                    WHERE iii.post_id = p.id
                        and ((iii.namespace_from = $1 and iii.username_from = $2)
                        or (iii.namespace_to = $1 and iii.username_to = $2))
                ) as last_invitation_date
            from posts as p
            join users as u on u.namespace = p.namespace and u.username = p.username
            where p.id in (
                select iiiii.post_id
                from invitations as iiiii
                join conferences as ccccc on ccccc.id = iiiii.conference_id
                where ccccc.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                    and ((iiiii.namespace_from = $1 and iiiii.username_from = $2)
                    or (iiiii.namespace_to = $1 and iiiii.username_to = $2))
            )
        ) as main
        order by main.last_invitation_date desc        
    `;

    const data = await execute(c => c.query(query, params).then(r => r.rows));

    // ToDo: simplify it
    for (const row of data) {
        for (const conference of row.conferences) {
            const users: any[] = [];

            for (const invitation of conference.invitations) {
                if ((invitation.namespace_from === namespace && invitation.username_from === username) || (invitation.namespace_to === namespace && invitation.username_to === username)) {
                    invitation.is_private = false;
                }

                if (!users.find(x => x.namespace === invitation.namespace_from && x.username === invitation.username_from && x.is_private === invitation.is_private)) {
                    users.push({
                        namespace: invitation.namespace_from,
                        username: invitation.username_from,
                        fullname: invitation.fullname_from,
                        is_private: invitation.is_private
                    });
                }
                if (!users.find(x => x.namespace === invitation.namespace_to && x.username === invitation.username_to && x.is_private === false)) {
                    users.push({
                        namespace: invitation.namespace_to,
                        username: invitation.username_to,
                        fullname: invitation.fullname_to,
                        is_private: false
                    });
                }
            }

            conference.users = users.filter(x => x.is_private === false);

            for (const u of users.filter(x => x.is_private === true)) {
                if (!conference.users.find((x: any) => x.namespace === u.namespace && x.username === u.username)) {
                    conference.users.push(u);
                }
            }

            conference.users.filter((x: any) => x.is_private === true).forEach((x: any) => {
                x.namespace = '';
                x.username = '';
                x.fullname = '';
            })

            // fill is_from_me property
            conference.users.forEach((u: any) => u.is_from_me = !!conference.invitations.find((i: any) => i.namespace_to === u.namespace && i.username_to === u.username && i.namespace_from === namespace && i.username_from === username));
            
            delete conference.invitations;
        }
    }

    //data.forEach(x => x.conferences.forEach((y: any) => delete y.invitations));
    return data;
}

export async function getAllWithMyTags(namespace: string, username: string, teamId?: string): Promise<PostWithTags[]> {

    const params = [namespace, username, teamId ?? null];
    const query = `
        SELECT
            p.id,
            p.text,
            u.namespace,
            u.username,
            u.fullname,
            u.img,
            (
                SELECT
                    COALESCE(json_agg(json_build_object(
                        'id', t.id,
                        'name', t.name,
                        'value', it.value,
                        'created', it.created,
                        'modified', it.modified
                    )) FILTER (WHERE t.id IS NOT NULL), '[]') 
                FROM itemtags as it
                JOIN tags as t on t.id = it.tag_id
                WHERE it.item_id = p.id
                    AND it.namespace = $1 
                    AND it.username = $2
                    AND (t.team_id IS NULL OR t.team_id = $3)
            ) as tags
        FROM posts as p 
        JOIN users as u on u.namespace = p.namespace and u.username = p.username
        WHERE (
            SELECT COUNT(*)
            FROM invitations as i 
            JOIN conferences as c on c.id = i.conference_id
            WHERE i.post_id = p.id
                AND (c.date_to >= DATE(NOW() - INTERVAL '3 DAY'))
        ) <> 0
        GROUP BY p.id, u.namespace, u.username;
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}