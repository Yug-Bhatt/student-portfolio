function Error() {
  return (
    <div
      className="error-message"
      style={{
        textAlign: "center",
        justifyContent: "center",
        padding: "24px",
        margin: "20px 0",
      }}
    >
      <span>⚠ Failed to load repositories from GitHub API. Please check your connection or rate limit.</span>
    </div>
  );
}

export default Error;