import { execute } from '../connection';
import { Profile } from '../types';

export async function getUsers(): Promise<Profile[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM users;');
        return res.rows;
    });
}

export async function getUser(namespace: string, username: string): Promise<Profile[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM users WHERE namespace = $1 and username = $2;', [namespace, username]);
        return res.rows[0];
    });
}

export async function createUser(u: Profile): Promise<Profile> {
    if (!u.namespace || !u.username) throw new Error('namespace and username are required!');

    return execute(async (client) => {
        const entries = Object.entries(u);
        const values = entries.map(x => x[1]);

        const fields = entries.map(x => x[0]).join(', '); // name, short_name, date_from, date_to
        const variables = entries.map((_, i) => '$' + (i + 1)).join(', '); // $1, $2, $3, $4
        const query = `INSERT INTO users(${fields}) VALUES (${variables}) RETURNING *;`;

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function updateUser(u: Profile): Promise<Profile> {
    if (!u.namespace || !u.username) throw new Error('namespace and username are required!');

    return execute(async (client) => {
        const query = `UPDATE users 
            SET fullname = $3,
                img = $4,
                main_conference_id = $5
            WHERE namespace = $1
                AND username = $2
            RETURNING *;`;

        const values = [u.namespace, u.username, u.fullname, u.img, u.main_conference_id];

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function getUserAttendance(namespace: string, username: string): Promise<any> {
    const query = `
        select
            short_name
        from attendance as a
        join conferences as c on c.id = a.conference_id
        where a.namespace = $1 and a.username = $2
            and c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
        order by c.date_to DESC;
    `;
    const params = [namespace, username];

    const info = await execute(c => c.query(query, params).then(x => x.rows));

    //info.forEach(x => x.conference_id = parseInt(x.conference_id));

    return info;
}

export async function getStat(filters?: { excludePosts?: string[], limit?: number }): Promise<any[]> {
    const isFilter = filters?.excludePosts && filters?.excludePosts.length > 0;

    const params = isFilter ? [filters?.limit ?? 10, filters!.excludePosts] : [filters?.limit ?? 10];

    const data = await execute(async (client) => {
        const res = await client.query(`
            SELECT * 
            FROM (
                SELECT
                    u.*,
                    
                    (
                        SELECT COUNT(*) 
                        FROM invitations AS i 
                        JOIN conferences AS c ON c.id = i.conference_id
                        WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                            AND i.namespace_to = u.namespace
                            AND i.username_to = u.username
                            ${isFilter ? 'AND NOT (i.post_id = ANY ($2))' : ''}
                    ) AS invitations_to_count,
                    
                    (
                        SELECT COUNT(*)
                        FROM (
                            SELECT COUNT(*) 
                            FROM invitations AS i 
                            JOIN conferences AS c ON c.id = i.conference_id
                            WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                                AND i.namespace_to = u.namespace
                                AND i.username_to = u.username
                                ${isFilter ? 'AND NOT (i.post_id = ANY ($2))' : ''}
                            GROUP BY i.namespace_from, i.username_from, i.post_id
                        ) AS x
                    ) AS agg_invitations_to_count,
                        
                    (
                        SELECT COUNT(*) 
                        FROM invitations AS i  
                        JOIN conferences AS c ON c.id = i.conference_id
                        WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                            AND i.namespace_from = u.namespace
                            AND i.username_from = u.username
                            ${isFilter ? 'AND NOT (i.post_id = ANY ($2))' : ''}
                    ) AS invitations_from_count,
                        
                    (
                        SELECT COUNT(*)
                        FROM attendance AS a 
                        JOIN conferences AS c ON c.id = a.conference_id
                        WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                            AND a.namespace = u.namespace
                            AND a.username = u.username
                    ) AS attendance_count,
                        
                    (
                        SELECT COUNT(*)
                        FROM (
                            SELECT i.namespace_from, i.username_from
                            FROM invitations AS i 
                            JOIN conferences AS c ON c.id = i.conference_id
                            WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                                AND i.namespace_to = u.namespace
                                AND i.username_to = u.username
                                ${isFilter ? 'AND NOT (i.post_id = ANY ($2))' : ''}
                            GROUP BY i.namespace_from, i.username_from
                        ) AS x
                    ) AS users_to_count,
                        
                    (
                        SELECT COUNT(*)
                        FROM (
                            SELECT i.conference_id
                            FROM invitations AS i 
                            JOIN conferences AS c ON c.id = i.conference_id
                            WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                                AND i.namespace_to = u.namespace
                                AND i.username_to = u.username
                                ${isFilter ? 'AND NOT (i.post_id = ANY ($2))' : ''}
                            GROUP BY i.conference_id
                        ) AS x
                    ) AS confrences_to_count,
                        
                    (
                        SELECT COUNT(*)
                        FROM (
                            SELECT i.post_id
                            FROM invitations AS i 
                            JOIN conferences AS c ON c.id = i.conference_id
                            WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                                AND i.namespace_to = u.namespace
                                AND i.username_to = u.username
                                ${isFilter ? 'AND NOT (i.post_id = ANY ($2))' : ''}
                            GROUP BY i.post_id
                        ) AS x
                    ) AS posts_to_count
                
                FROM users AS u
                WHERE EXISTS (
                    SELECT *
                    FROM invitations AS i
                    JOIN conferences AS c ON c.id = i.conference_id
                    WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                        AND (
                            i.namespace_from = u.namespace AND i.username_from = u.username
                            OR i.namespace_to = u.namespace AND i.username_to = u.username
                        )
                ) OR EXISTS (
                    SELECT *
                    FROM attendance AS a
                    JOIN conferences AS c ON c.id = a.conference_id
                    WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                        AND a.namespace = u.namespace
                        AND a.username = u.username
                )
            ) as main
            ORDER BY main.agg_invitations_to_count DESC
            LIMIT $1
        `, params);
        return res.rows;
    });

    data.forEach(d => {
        d.invitations_to_count = parseInt(d.invitations_to_count);
        d.agg_invitations_to_count = parseInt(d.agg_invitations_to_count);
        d.invitations_from_count = parseInt(d.invitations_from_count);
        d.attendance_count = parseInt(d.attendance_count);
        d.users_to_count = parseInt(d.users_to_count);
        d.confrences_to_count = parseInt(d.confrences_to_count);
        d.posts_to_count = parseInt(d.posts_to_count);
    });

    return data;
}

type UserSettings = {
    teamId?: string;
    teamName?: string;
}

const settings: any = {};

export async function getUserSettings(namespace: string, username: string): Promise<UserSettings> {
    const key = namespace + '/' + username;
    const view = settings[key] || {};
    if (view.teamId) {
        view.teamName = (await getTeam(view.teamId)).name;
    }
    return Promise.resolve(view);
}

export async function setUserSettings(namespace: string, username: string, s: UserSettings): Promise<void> {
    const key = namespace + '/' + username;
    if (s.teamId) getTeam(s.teamId);
    settings[key] = s;
    return Promise.resolve();
}

export async function getTeam(id: string) {
    const query = `SELECT * FROM teams WHERE id = $1;`;
    const params = [id];
    return execute(c => c.query(query, params).then(x => x.rows[0]));
}