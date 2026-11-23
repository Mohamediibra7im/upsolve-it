import { rankName } from "./rank";

const getRankFromRating = (rating: number): string => rankName(rating);

export default getRankFromRating;
