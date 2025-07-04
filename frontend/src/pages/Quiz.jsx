import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import styles from "./Quiz.module.css";

// Quiz page: allows users to generate an AI quiz or take a quiz by code
export default function Quiz() {
  // State variables for quiz generation and answering
  const [topic, setTopic] = useState("Python basics");
  const [numQuestions, setNumQuestions] = useState(3);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Generate a quiz using the AI agent
  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const res = await api.post("/ai/assist", {
        topic,
        num_questions: numQuestions,
      });
      setQuestions(res.questions);
      setAnswers(Array(res.questions.length).fill(null));
    } catch (err) {
      setError(err.message || "Failed to generate quiz");
    }
  };

  // Fetch quiz by code if code param exists in URL
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setError("");
      setResult(null);
      (async () => {
        try {
          const res = await api.get(`/quizzes/code/${code}`);
          if (res.quiz && res.quiz.questions) {
            setQuizTitle(res.quiz.title || res.quiz.topic || "Quiz");
            setQuestions(res.quiz.questions);
            setAnswers(Array(res.quiz.questions.length).fill(null));
          } else {
            setError("Quiz not found or has no questions.");
          }
        } catch (err) {
          // Handle HTML error response (e.g., 404 returns HTML, not JSON)
          if (
            err.message &&
            (err.message.startsWith("Unexpected token <") ||
              err.message.includes("API error"))
          ) {
            setError(
              "Quiz not found. Please check the test code or ask your admin."
            );
          } else {
            setError(err.message || "Failed to fetch quiz by code");
          }
        }
      })();
    }
  }, [searchParams]);

  // Handles quiz submission and sends answers to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    const code = searchParams.get("code");
    if (!code) return setError("Quiz code missing.");
    try {
      // Prepare answers in backend format: [{ questionId, selectedOptionId }]
      const quizRes = await api.get(`/quizzes/code/${code}`);
      const quiz = quizRes.quiz;
      if (!quiz || !quiz.questions) throw new Error("Quiz not found.");
      // Check for missing IDs
      if (
        !quiz.questions.every((q) => q.id && q.options.every((opt) => opt.id))
      ) {
        setError("Quiz data missing IDs. Please contact admin.");
        return;
      }
      const formattedAnswers = answers.map((ansIdx, i) => ({
        questionId: quiz.questions[i].id,
        selectedOptionId: quiz.questions[i].options[ansIdx].id,
      }));
      const attemptRes = await api.post(`/attempts/${quiz.id}`, {
        answers: formattedAnswers,
      });
      // Prepare result data for result page
      const resultData = {
        ...attemptRes.attempt,
        questions: quiz.questions.map((q) => ({
          question: q.question,
          options: q.options.map((opt) => opt.text || opt.option_text),
          answer: q.options.findIndex((opt) => opt.is_correct),
        })),
        user_answers: answers,
        quiz_title: quiz.title || quiz.topic,
        score: attemptRes.score,
      };
      navigate("/result", { state: { attempt: resultData } });
    } catch (err) {
      let msg = "Failed to submit quiz";
      if (err && err.message) {
        msg = err.message;
        // If HTML error, show more detail
        if (msg.startsWith("Server error:")) {
          msg +=
            "\n\nThis usually means the backend route is missing or the server is not running.";
        }
      }
      setError(msg);
      // Debug: log error
      console.error("Quiz submit error:", err);
    }
  };

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizCard}>
        <h2 className={styles.quizTitle}>
          {searchParams.get("code") ? quizTitle || "Quiz" : "Quiz Generator"}
        </h2>
        {/* Quiz generation form (if not taking quiz by code) */}
        {!searchParams.get("code") && (
          <form
            onSubmit={handleGenerate}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 16,
              marginBottom: 24,
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 16,
                width: 180,
              }}
            />
            <input
              type="number"
              min={1}
              max={10}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 16,
                width: 80,
              }}
            />
            <button
              type="submit"
              style={{
                background: "linear-gradient(90deg, #22d3ee 0%, #2563eb 100%)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 20,
                padding: "10px 32px",
                fontSize: 16,
                boxShadow: "0 2px 8px 0 rgba(34,211,238,0.08)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Generate Quiz
            </button>
          </form>
        )}
        {/* Error message */}
        {error && <div className={styles.quizError}>{error}</div>}
        {/* Quiz questions form */}
        {questions.length > 0 && (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {questions.map((q, i) => (
              <div key={i}>
                <div className={styles.quizQuestion}>
                  {i + 1}. {q.question}
                </div>
                <div>
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className={styles.quizOption}
                      style={{
                        fontWeight: answers[i] === j ? 700 : 500,
                        border:
                          answers[i] === j
                            ? "2px solid #2563eb"
                            : "2px solid transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        checked={answers[i] === j}
                        onChange={() =>
                          setAnswers((a) =>
                            a.map((val, idx) => (idx === i ? j : val))
                          )
                        }
                        className={styles.quizRadio}
                        required
                      />
                      <span>{opt.option_text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" className={styles.quizSubmitBtn}>
              Submit Quiz
            </button>
          </form>
        )}
        {/* Result message (if any) */}
        {result && <div className={styles.quizResult}>{result}</div>}
      </div>
    </div>
  );
}
