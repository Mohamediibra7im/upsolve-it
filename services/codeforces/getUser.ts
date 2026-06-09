import { User } from "@/types/User";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

const getUser = async (handle: string): Promise<Response<User>> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    const data = await res.json();
    if (data.status !== "OK") {
      const comment: string = data?.comment ?? "";
      if (comment.includes("not found") || comment.includes("handle")) {
        return ErrorResponse("User not found");
      }
      return ErrorResponse("Codeforces API is currently unavailable. Please try again later.");
    }
    const user = data.result[0];
    return SuccessResponse({
      codeforcesHandle: user.handle,
      rating: user.rating,
      rank: user.rank,
      avatar: user.avatar,
      maxRating: user.maxRating,
      maxRank: user.maxRank,
      organization: user.organization,
    } as User);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return ErrorResponse("Codeforces API request timed out. Try again.");
    }
    return ErrorResponse("Unable to reach Codeforces. Please try again later.");
  }
};

export default getUser;



