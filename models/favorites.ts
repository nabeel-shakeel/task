import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true
    },
    repositoryName: {
        type: String,
        required: true
    }
});

export const Favorite = mongoose.model('Favorite', favoriteSchema);
