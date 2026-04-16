export type NormalizedApiError = {
  title: string;
  message: string;
  statusCode?: number;
};

function titleForStatus(code: number): string {
  if (code === 401) return "Session required";
  if (code === 403) return "Access denied";
  if (code === 404) return "Not found";
  if (code === 429) return "Too many requests";
  if (code >= 500) return "Server error";
  return "Request failed";
}

export function parseErrorFromUnknown(err: unknown): NormalizedApiError {
  if (err instanceof TypeError && /fetch|network|load failed/i.test(String(err.message))) {
    return {
      title: "Network error",
      message:
        "We could not reach the server. Check your connection and try again.",
    };
  }
  if (err instanceof Error) {
    return {
      title: "Something went wrong",
      message: err.message || "An unexpected error occurred.",
    };
  }
  return {
    title: "Something went wrong",
    message: "An unexpected error occurred.",
  };
}

export async function parseErrorFromResponse(
  res: Response
): Promise<NormalizedApiError> {
  const statusCode = res.status;
  let message = res.statusText || `Request failed (${statusCode})`;

  const text = await res.text();
  if (text.trim()) {
    try {
      const data = JSON.parse(text) as { message?: string };
      if (typeof data?.message === "string" && data.message.trim()) {
        message = data.message;
      }
    } catch {
      message = text.slice(0, 280);
    }
  }

  return {
    title: titleForStatus(statusCode),
    message,
    statusCode,
  };
}
