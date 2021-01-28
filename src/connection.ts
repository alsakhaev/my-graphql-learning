import { Client, types } from 'pg';

export async function execute<T>(callback: (client: Client) => Promise<T>): Promise<T> {

    types.setTypeParser(1114, v => new Date(v + "Z")); // fix of invalid timezone

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    let result;

    try {
        result = await callback(client);
    } finally {
        client.end();
    }

    return result;
}