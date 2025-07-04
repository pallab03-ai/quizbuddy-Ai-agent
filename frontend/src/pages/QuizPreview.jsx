import React from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import "./QuizGenerator.css";

export default function QuizPreview() {
  const location = useLocation();
  // Expecting { questions, topic } in state
  const { questions = [], topic = "" } = location.state || {};

  const [creating, setCreating] = React.useState(false);
  const [quizCode, setQuizCode] = React.useState("");
  const [error, setError] = React.useState("");

  const handleCreateQuiz = async () => {
    setCreating(true);
    setError("");
    setQuizCode("");
    try {
      // Send quiz to backend
      const res = await api.post("/quizzes/full", {
        title: topic || "AI Generated Quiz",
        topic,
        questions,
      });
      setQuizCode(res.code);
    } catch (err) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="quizGenBg">
      <div className="quizGenCard">
        <div className="quizGenTitle">Quiz Preview</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 24,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              color: "#2563eb",
              fontWeight: 700,
              fontSize: 18,
              marginRight: 12,
            }}
          >
            Topic:
          </span>
          <span
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
              padding: "2px 12px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {topic}
          </span>
        </div>
        <div className="space-y-8">
          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 32 }}>
              <div
                className="bg-blue-50 rounded-xl p-6 shadow flex flex-col gap-3 border border-blue-100"
                style={{
                  alignItems: "flex-start",
                  textAlign: "left",
                  marginLeft: 24,
                }}
              >
                <div
                  className="font-bold text-xl text-blue-900 mb-2"
                  style={{ textAlign: "left" }}
                >
                  {i + 1}. {q.question}
                </div>
                <ol
                  className="quizGenListOptions"
                  style={{ textAlign: "left" }}
                >
                  {q.options.map((opt, idx) => (
                    <li
                      key={idx}
                      style={{
                        color: idx === q.answer ? "#059669" : undefined,
                        fontWeight: idx === q.answer ? 700 : 400,
                        textAlign: "left",
                      }}
                    >
                      {opt}{" "}
                      {idx === q.answer && (
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
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
        <button
          className="quizGenBtn mt-10"
          onClick={handleCreateQuiz}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Quiz"}
        </button>
        {quizCode && (
          <div
            className="mt-8 text-center text-2xl font-bold"
            style={{ color: "#059669" }}
          >
            Quiz Created! Unique Code:{" "}
            <span
              style={{
                background: "#bbf7d0",
                color: "#059669",
                padding: "4px 16px",
                borderRadius: 12,
              }}
            >
              {quizCode}
            </span>
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-lg text-red-600 font-semibold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
