import { execute } from '../connection';
import { Team, Post, Profile } from '../types';
import * as userService from './user';
import * as postService from './post';

export async function createTeam(c: Team): Promise<Team> {
    const query = `INSERT INTO teams(name) VALUES ($1) RETURNING *;`;
    const params = [c.name];
    const team = await execute(c => c.query(query, params).then(x => x.rows[0]));

    team.tags = [];

    for (const t of c.tags) {
        const tag = await execute(c => c.query(
            `INSERT INTO tags(name, team_id) VALUES ($1, $2) RETURNING *;`, 
            [t.name, team.id]
        ).then(x => x.rows[0]));
        
        team.tags.push(tag);
    }

    return team;
}