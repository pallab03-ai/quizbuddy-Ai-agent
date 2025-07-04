import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./QuizGenerator.css";
import { FaTrash } from "react-icons/fa";

// Admin dashboard: manage quizzes, view attempts, and delete quizzes
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]); // List of quizzes created by admin
  const [loading, setLoading] = useState(true); // Loading state for quizzes
  const [error, setError] = useState(""); // Error message
  const [selectedQuiz, setSelectedQuiz] = useState(null); // Currently selected quiz for viewing attempts
  const [attempts, setAttempts] = useState([]); // Attempts for selected quiz
  const [attemptsLoading, setAttemptsLoading] = useState(false); // Loading state for attempts

  // Fetch quizzes on mount
  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/quizzes");
        setQuizzes(
          (res.quizzes || []).filter(
            (q) => !q.title.toLowerCase().includes("sample")
          )
        );
      } catch (err) {
        setError(err.message || "Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  // View attempts for a specific quiz
  const handleQuizClick = async (quiz) => {
    setSelectedQuiz(quiz);
    setAttemptsLoading(true);
    setAttempts([]);
    try {
      const res = await api.get(`/attempts/admin/by-quiz?quizId=${quiz.id}`);
      setAttempts(res.attempts || []);
    } catch (err) {
      setError(err.message || "Failed to fetch attempts");
    } finally {
      setAttemptsLoading(false);
    }
  };

  // Delete a quiz
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      setQuizzes((qs) => qs.filter((q) => q.id !== quizId));
      if (selectedQuiz && selectedQuiz.id === quizId) setSelectedQuiz(null);
    } catch (err) {
      setError(err.message || "Failed to delete quiz");
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
          <div className="quizGenTitle">Admin Dashboard</div>
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
        {/* Quizzes table or loading/error state */}
        {loading ? (
          <div>Loading quizzes...</div>
        ) : error ? (
          <div style={{ color: "#e11d48" }}>{error}</div>
        ) : (
          <>
            <div
              style={{ fontWeight: 600, marginBottom: 16, color: "#2563eb" }}
            >
              Total Tests Created: {quizzes.length}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 24,
                }}
              >
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th
                      style={{
                        padding: 12,
                        textAlign: "center",
                        minWidth: 180,
                      }}
                    >
                      Topic
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: "center",
                        minWidth: 180,
                      }}
                    >
                      Test Code
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: "center",
                        minWidth: 220,
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr
                      key={quiz.id}
                      style={{ borderBottom: "1px solid #e5e7eb" }}
                    >
                      <td
                        style={{
                          padding: 12,
                          textAlign: "center",
                          fontSize: 18,
                          fontWeight: 500,
                          verticalAlign: "middle",
                        }}
                      >
                        {quiz.title}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          textAlign: "center",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#16a34a",
                          fontFamily: "monospace",
                          verticalAlign: "middle",
                        }}
                      >
                        {quiz.code}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 24,
                          }}
                        >
                          {/* View Attempts button */}
                          <button
                            className="quizGenBtn"
                            style={{
                              padding: "8px 24px",
                              fontSize: 16,
                              background: "#3b82f6",
                              borderRadius: 20,
                              fontWeight: 700,
                              boxShadow: "0 2px 8px 0 rgba(59,130,246,0.08)",
                              minWidth: 160,
                            }}
                            onClick={() => handleQuizClick(quiz)}
                          >
                            View Attempts
                          </button>
                          {/* Delete quiz button */}
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              marginLeft: 0,
                              display: "flex",
                              alignItems: "center",
                            }}
                            title="Delete Test"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <FaTrash color="#e11d48" size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Attempts table for selected quiz */}
            {selectedQuiz && (
              <div style={{ marginTop: 32 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#2563eb",
                    marginBottom: 12,
                  }}
                >
                  Attempts for: {selectedQuiz.title} (Code:{" "}
                  <span style={{ color: "#059669" }}>{selectedQuiz.code}</span>)
                </div>
                {attemptsLoading ? (
                  <div>Loading attempts...</div>
                ) : attempts.length === 0 ? (
                  <div style={{ color: "#64748b" }}>
                    No students have appeared for this test yet.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: 10, textAlign: "left" }}>
                          Student User ID
                        </th>
                        <th style={{ padding: 10, textAlign: "left" }}>
                          Username
                        </th>
                        <th style={{ padding: 10, textAlign: "left" }}>
                          Result / Score
                        </th>
                        <th style={{ padding: 10, textAlign: "left" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((a, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #e5e7eb" }}
                        >
                          <td style={{ padding: 10 }}>{a.user_id}</td>
                          <td style={{ padding: 10 }}>{a.username}</td>
                          <td style={{ padding: 10, fontWeight: 600 }}>
                            {a.score}
                          </td>
                          <td style={{ padding: 10 }}>
                            {/* View result for this attempt */}
                            <button
                              className="quizGenBtn"
                              style={{
                                padding: "6px 18px",
                                fontSize: 15,
                                background: "#2563eb",
                                color: "#fff",
                                borderRadius: 12,
                                fontWeight: 700,
                              }}
                              onClick={async () => {
                                try {
                                  const res = await api.get(
                                    `/attempts/${a.attempt_id}`
                                  );
                                  if (res && res.attempt) {
                                    navigate("/result", {
                                      state: { attempt: res.attempt },
                                    });
                                  } else {
                                    alert("Could not load attempt details.");
                                  }
                                } catch (err) {
                                  alert(
                                    "Error loading result: " +
                                      (err.message || err)
                                  );
                                }
                              }}
                            >
                              Result
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
        {/* Quiz Generator button */}
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 40 }}
        >
          <button
            className="quizGenBtn"
            style={{ width: 220, fontSize: 18 }}
            onClick={() => (window.location.href = "/quiz-generator")}
          >
            Quiz Generator
          </button>
        </div>
      </div>
    </div>
  );
}
