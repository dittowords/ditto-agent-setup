const MESSAGES = {
  network: "Whoops!! Something went wrong, please try again later!!!",
  auth: "ERROR: invalid credentials.",
  expired: "Your session expired. Please sign in again.",
  expiredAlt: "Session timed out, please log in again",
};

export function ErrorBanner({ kind }) {
  return (
    <div role="alert" className="error-banner">
      {MESSAGES[kind] ?? "An unexpected error has occurred in the system."}
      <button>Dismiss</button>
    </div>
  );
}
