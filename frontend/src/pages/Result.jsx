import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import api from "../api"; // Not used in this file
import "./QuizGenerator.css";

// Result page: displays quiz attempt results and allows discussion for incorrect answers
export default function Result() {
  const location = useLocation();
  // Load attempt from navigation state or global (admin) variable
  const [attempt, setAttempt] = useState(
    () =>
      (location.state && location.state.attempt) ||
      (window.location.search.includes("admin=1")
        ? window.__adminAttempt
        : undefined)
  );
  // If admin is waiting for result to be sent via postMessage
  const [waitingForAdmin, setWaitingForAdmin] = useState(
    !((location.state && location.state.attempt) || window.__adminAttempt) &&
      window.location.search.includes("admin=1")
  );
  const navigate = useNavigate();

  // Listen for result data sent via postMessage (admin view)
  useEffect(() => {
    if (waitingForAdmin) {
      const handler = (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.attempt) {
          setAttempt(event.data.attempt);
          setWaitingForAdmin(false);
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }
  }, [waitingForAdmin]);

  // Show loading or error if no attempt data
  if (!attempt) {
    if (waitingForAdmin) {
      return (
        <div className="quizGenBg">
          <div className="quizGenCard">Loading result...</div>
        </div>
      );
    }
    return (
      <div className="quizGenBg">
        <div className="quizGenCard">No result data found.</div>
      </div>
    );
  }

  // Support both old and new attempt formats
  const questions = attempt.questions || [];

  // Navigate to chat page to discuss a question
  const handleDiscuss = (qIdx, question) => {
    navigate("/chat", { state: { question } });
  };

  return (
    <div className="quizGenBg">
      <div className="quizGenCard" style={{ maxWidth: 900, width: "100%" }}>
        <div className="quizGenTitle">Test Result</div>
        <div style={{ fontWeight: 600, marginBottom: 16, color: "#2563eb" }}>
          Topic: {attempt.quiz_title || attempt.topic} | Score: {attempt.score}
        </div>
        <div style={{ marginBottom: 24 }}>
          {/* List all questions and answers */}
          {questions.length > 0 ? (
            questions.map((q, i) => {
              // For new format: q.options is array of {id, option_text}, user_answer/correct_answer are option ids
              // For old format: q.options is array of strings, user_answers is array of indices
              let userAns = q.user_answer;
              let correctAns = q.correct_answer;
              // Fallback for old format
              if (userAns === undefined && attempt.user_answers)
                userAns = attempt.user_answers[i];
              if (correctAns === undefined && q.answer !== undefined)
                correctAns = q.answer;
              const isCorrect = userAns === correctAns;
              return (
                <div
                  key={i}
                  style={{
                    marginBottom: 32,
                    background: "#f1f5f9",
                    borderRadius: 12,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#1d4ed8",
                      marginBottom: 8,
                    }}
                  >
                    {i + 1}. {q.question}
                  </div>
                  <ol style={{ paddingLeft: 24, marginBottom: 8 }}>
                    {q.options.map((opt, idx) => {
                      // Support both formats
                      const optionId = opt.id !== undefined ? opt.id : idx;
                      const optionText = opt.option_text || opt;
                      return (
                        <li
                          key={optionId}
                          style={{
                            color:
                              optionId === correctAns
                                ? "#059669"
                                : optionId === userAns
                                ? "#e11d48"
                                : "#334155",
                            fontWeight:
                              optionId === correctAns || optionId === userAns
                                ? 700
                                : 400,
                          }}
                        >
                          {optionText}{" "}
                          {optionId === correctAns && (
                            <span
                              style={{
                                marginLeft: 8,
                                background: "#bbf7d0",
                                color: "#059669",
                                padding: "2px 8px",
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                            >
                              Correct
                            </span>
                          )}
                          {optionId === userAns && !isCorrect && (
                            <span
                              style={{
                                marginLeft: 8,
                                background: "#fee2e2",
                                color: "#e11d48",
                                padding: "2px 8px",
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                            >
                              Your Answer
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  {/* Show Discuss button for incorrect answers */}
                  {!isCorrect && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="quizGenBtn"
                        style={{
                          padding: "6px 18px",
                          fontSize: 15,
                          background: "#2563eb",
                          color: "#fff",
                          borderRadius: 12,
                          fontWeight: 700,
                          marginBottom: 8,
                        }}
                        onClick={() => handleDiscuss(i, q.question)}
                      >
                        Discuss
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div>No question data found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
