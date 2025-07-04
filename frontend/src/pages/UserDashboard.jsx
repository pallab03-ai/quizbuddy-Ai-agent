import React, { useEffect, useState } from "react";
import api from "../api";
import "./QuizGenerator.css";
import { useNavigate } from "react-router-dom";

// User dashboard: shows user's quiz attempts and allows taking new quizzes by code
export default function UserDashboard() {
  const [attempts, setAttempts] = useState([]); // List of user's quiz attempts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error message
  const [showCodeBox, setShowCodeBox] = useState(false); // Show/hide test code input
  const [testCode, setTestCode] = useState(""); // Test code input value
  const navigate = useNavigate();

  // Fetch user's quiz attempts on mount
  useEffect(() => {
    async function fetchAttempts() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/attempts");
        setAttempts(res.attempts || []);
      } catch (err) {
        if (err.message === "Forbidden") {
          setError(
            "You do not have access to this page. Please log in as a user."
          );
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError(err.message || "Failed to fetch attempts");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAttempts();
  }, [navigate]);

  // View result for a specific attempt
  const handleViewResult = async (attempt) => {
    try {
      const res = await api.get(`/attempts/${attempt.id}`);
      if (res && res.attempt) {
        navigate("/result", { state: { attempt: res.attempt } });
      } else {
        alert("Could not load attempt details.");
      }
    } catch (err) {
      alert("Error loading result: " + (err.message || err));
    }
  };

  // Show the test code input box
  const handleTakeTest = () => {
    setShowCodeBox(true);
  };

  // Handle test code form submission
  const handleSubmitCode = (e) => {
    e.preventDefault();
    if (testCode.trim()) {
      navigate(`/quiz?code=${testCode.trim()}`);
    }
  };

  return (
    <div className="quizGenBg">
      <div
        className="quizGenCard"
        style={{ maxWidth: 900, width: "100%", position: "relative" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="quizGenTitle">User Dashboard</div>
          {/* Profile button */}
          <button
            className="quizGenBtn"
            style={{
              width: 120,
              fontSize: 16,
              borderRadius: 20,
              fontWeight: 700,
              background: "#6366f1",
              color: "#fff",
              marginLeft: 16,
            }}
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </div>
        {/* Take Test button */}
        <button
          className="quizGenBtn"
          style={{ marginBottom: 24, width: 200, alignSelf: "center" }}
          onClick={handleTakeTest}
        >
          Take Test
        </button>
        {/* Test code input form */}
        {showCodeBox && (
          <form
            onSubmit={handleSubmitCode}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
              justifyContent: "center",
            }}
          >
            <input
              className="quizGenInput"
              type="text"
              placeholder="Enter Test Code"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              required
              style={{ width: 220 }}
            />
            <button
              className="quizGenBtn"
              type="submit"
              style={{
                padding: "12px 36px",
                fontSize: 18,
                borderRadius: 20,
                fontWeight: 700,
              }}
            >
              Go
            </button>
          </form>
        )}
        {/* Attempts table or loading/error/empty state */}
        {loading ? (
          <div>Loading your attempts...</div>
        ) : error ? (
          <div style={{ color: "#e11d48" }}>{error}</div>
        ) : attempts.length === 0 ? (
          <div style={{ color: "#64748b" }}>
            You have not taken any tests yet.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 24,
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ padding: 12, textAlign: "center" }}>Test Topic</th>
                <th style={{ padding: 12, textAlign: "center" }}>Score</th>
                <th style={{ padding: 12, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td
                    style={{ padding: 12, textAlign: "center", fontSize: 18 }}
                  >
                    {a.title ||
                      a.quiz_title ||
                      a.quiz_topic ||
                      a.topic ||
                      "N/A"}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    {a.score}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      className="quizGenBtn"
                      style={{
                        padding: "8px 24px",
                        fontSize: 16,
                        background: "#3b82f6",
                        borderRadius: 20,
                        fontWeight: 700,
                      }}
                      onClick={() => handleViewResult(a)}
                    >
                      View Result
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
