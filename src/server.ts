import axios from 'axios';
import session, { Session } from 'express-session';

import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello, GitHub Repo Explorer!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

app.use(
    session({
      secret: 'your_secret_key',
      resave: false,
      saveUninitialized: true,
    })
  );

  interface CustomSession extends Session {
    githubToken?: string;
  }


const GITHUB_CLIENT_ID = 'd839c0529ad2fa9b118e';
const GITHUB_CLIENT_SECRET = 'efe1419fbd141f9e91a14a8e35eb4ee60a51866e';
const REDIRECT_URI = 'http://localhost:3000/auth/github/callback';

app.get('/auth/github', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`);
});

app.get('/auth/github/callback', async (req, res) => {
    const code = req.query.code as string;
    try {
        const tokenResponse = await axios.post(`https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`);
        const accessToken = new URLSearchParams(tokenResponse.data).get('access_token');
        if (accessToken) {
            (req.session as CustomSession).githubToken = accessToken;
            res.send('Authentication successful!');
        } else {
            res.status(400).send('Error getting access token');
        }
    } catch (err) {
        res.status(500).send('Error during authentication');
    }
});


const GITHUB_API_URL = 'https://api.github.com/search/repositories';

app.get('/search', async (req, res) => {
    const query: string = req.query.q as string; // This is the search query string from the client
    const userToken: string | undefined = (req.session as CustomSession).githubToken;

    if (!userToken) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const response = await axios.get(GITHUB_API_URL, {
            headers: {
                'Authorization': `token ${userToken}`
            },
            params: {
                q: query
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch data from GitHub'
        });
    }
});



/*

app.post('/favorites', async (req, res) => {
    const { githubId, repoName } = req.body;
    try {
        const db = await getDatabaseConnection();
        await db.run('INSERT INTO favorites (githubId, repoName) VALUES (?, ?)', [githubId, repoName]);
        res.status(201).json({ message: "Favorite added successfully." });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add favorite.' });
    }
});

app.get('/favorites', async (req, res) => {
    try {
        const db = await getDatabaseConnection();
        const favorites = await db.all('SELECT * FROM favorites');
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve favorites.' });
    }
});

app.put('/favorites/:githubId', async (req, res) => {
    const githubId = req.params.githubId;
    const { repoName } = req.body;
    try {
        const db = await getDatabaseConnection();
        await db.run('UPDATE favorites SET repoName = ? WHERE githubId = ?', [repoName, githubId]);
        res.json({ message: "Favorite updated successfully." });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update favorite.' });
    }
});


app.delete('/favorites/:githubId', async (req, res) => {
    const githubId = req.params.githubId;
    try {
        const db = await getDatabaseConnection();
        await db.run('DELETE FROM favorites WHERE githubId = ?', [githubId]);
        res.json({ message: "Favorite deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete favorite.' });
    }
});

*/
