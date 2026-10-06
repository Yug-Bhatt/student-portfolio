/**
 * Loading Component
 * Reusable loading indicator used for route Suspense fallbacks and data fetching states.
 */
function Loading({ message = "Loading page..." }) {
  return (
    <div className="page-loading">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loading;