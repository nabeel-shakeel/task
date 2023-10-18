import mongoose, { Document, Schema } from 'mongoose';

interface FavoriteRepository extends Document {
  repoId: number;
  name: string;
  owner: string;
}

const favoriteRepositorySchema = new Schema<FavoriteRepository>({
  repoId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  owner: { type: String, required: true },
});

const FavoriteRepositoryModel = mongoose.model<FavoriteRepository>('FavoriteRepository', favoriteRepositorySchema);

export default FavoriteRepositoryModel;