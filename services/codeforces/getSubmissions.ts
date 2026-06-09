import { User } from "@/types/User";
import { CodeforcesSubmission } from "@/types/Codeforces";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

const getSubmissions = async (
  user: User,
  from?: number,
  count?: number,
): Promise<Response<CodeforcesSubmission[]>> => {
  try {
    let url = `https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`;
    if (from) {
      url += `&from=${from}`;
    }
    if (count) {
      url += `&count=${count}`;
    }

    // Timeout to prevent hanging on slow/unresponsive CF API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (data.status !== "OK") {
      const comment: string = data?.comment ?? "";
      if (comment.includes("not found") || comment.includes("handle")) {
        return ErrorResponse("User not found on Codeforces");
      }
      return ErrorResponse("Codeforces API is currently unavailable. Please try again later.");
    }
    return SuccessResponse(data.result);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return ErrorResponse("Codeforces API request timed out. Try again.");
    }
    return ErrorResponse((error as Error).message);
  }
};

export default getSubmissions;



