import axios from 'axios';
import session, { Session } from 'express-session';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import config from '../config/config';
import { Favorite } from '../models/favorites';

import { db } from '../database';

const app = express();
const PORT = config.server.port;

app.get('/', (req, res) => {
    res.send('Hello, GitHub Repo Explorer!');
});

// app.listen(PORT, () => {
//     console.log(`Server is running at http://localhost:${PORT}`);
// });

dotenv.config();

mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        console.log('Connected to mongoDB.');
        app.listen(PORT, () => {
            console.log(`Server is running at::: http://localhost:${PORT}`);
        });
      console.log(`Running on ENV = ${process.env.NODE_ENV}`);
      
    })
    .catch((error) => {
        console.log('Unable to connect.');
        console.log(error);
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


// const GITHUB_CLIENT_ID = 'd839c0529ad2fa9b118e';
// const GITHUB_CLIENT_SECRET = 'efe1419fbd141f9e91a14a8e35eb4ee60a51866e';
// const REDIRECT_URI = 'http://localhost:3000/auth/github/callback';

const GITHUB_CLIENT_ID = process.env.CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.CLIENT_SECRET;

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

app.use(express.json());

app.post('/favorites', async (req, res) => {
    try {
        console.log('favortie exists!');
        const favorite = new Favorite(req.body);
        await favorite.save();
        res.status(201).send(favorite);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/favorites', async (req, res) => {
    try {
        const favorites = await Favorite.find({});
        res.status(200).send(favorites);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get('/favorites/:id', async (req, res) => {
    try {
        const favorite = await Favorite.findById(req.params.id);
        if (!favorite) {
            return res.status(404).send();
        }
        res.status(200).send(favorite);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/favorites/:id', async (req, res) => {
    try {
        console.log('favortie exists!');
        const favorite = await Favorite.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!favorite) {
            return res.status(404).send();
        }
        res.status(200).send(favorite);
    } catch (error) {
        res.status(400).send(error);
    }
});


app.delete('/favorites/:id', async (req, res) => {
    try {
        const favorite = await Favorite.findByIdAndDelete(req.params.id);
        if (!favorite) {
            return res.status(404).send();
        }
        res.status(200).send(favorite);
    } catch (error) {
        res.status(500).send(error);
    }
});



// process.on('exit', () => {
//     db.close((err) => {
//         if (err) {
//             return console.error(err.message);
//         }
//         console.log('Closed the SQLite database.');
//     });
// });

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
