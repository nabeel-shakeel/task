import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const setupDatabase = async () => {
    const db = await open({
        filename: './github-explorer.sqlite',
        driver: sqlite3.Database
    });

    // Create the favorite repositories table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS favorite_repos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            repo_name TEXT,
            repo_url TEXT,
            UNIQUE(user_id, repo_name)
        )
    `;

    await db.exec(createTableQuery);

    return db;
};

export default setupDatabase;
