import React, { useState, useEffect } from "react";
import api from "../api";
import styles from "./QuizGenerator.module.css";
import { useNavigate } from "react-router-dom";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await api.get("/quizzes");
      // Ensure quizzes is always an array
      if (Array.isArray(data)) {
        setQuizzes(data);
      } else if (data && Array.isArray(data.quizzes)) {
        setQuizzes(data.quizzes);
      } else {
        setQuizzes([]);
        console.error("Unexpected /quizzes response:", data);
      }
    } catch (err) {
      // ignore fetch error
    }
  };

  const handleOptionChange = (idx, value) => {
    setOptions(options.map((opt, i) => (i === idx ? value : opt)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/quizzes", {
        question,
        options,
        answer,
      });
      setSuccess("Quiz created!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer(0);
      fetchQuizzes();
    } catch (err) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  // AI Quiz Generation
  const handleAIGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!topic.trim()) {
      setError("Please enter a topic for AI quiz generation.");
      return;
    }
    setAiLoading(true);
    try {
      const aiQuizResp = await api.post("/ai/assist", {
        topic,
        num_questions: numQuestions,
      });
      if (aiQuizResp.questions && aiQuizResp.questions.length > 0) {
        // Redirect to QuizPreview with all questions and topic
        navigate("/quiz-preview", {
          state: { questions: aiQuizResp.questions, topic },
        });
      } else {
        setError("AI did not return a valid quiz question.");
      }
    } catch (err) {
      setError(err.message || "AI quiz generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={styles.quizGenBg}>
      <div className={styles.quizGenCard}>
        <div className={styles.quizGenTitle}>Quiz Generator (Admin Only)</div>
        <form
          className={styles.quizGenForm}
          onSubmit={handleAIGenerate}
          style={{ marginBottom: 16 }}
        >
          <input
            className={styles.quizGenInput}
            type="text"
            placeholder="Enter topic for AI quiz generation"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <input
            className={styles.quizGenInput}
            type="number"
            min={1}
            max={10}
            placeholder="Number of questions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            required
            style={{ width: 180 }}
          />
          <button
            className={styles.quizGenBtn}
            type="submit"
            disabled={aiLoading}
          >
            {aiLoading ? "Generating..." : "Generate Quiz with AI"}
          </button>
        </form>
        <form className={styles.quizGenForm} onSubmit={handleSubmit}>
          <input
            className={styles.quizGenInput}
            type="text"
            placeholder="Enter question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          {options.map((opt, idx) => (
            <input
              key={idx}
              className={styles.quizGenInput}
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
          ))}
          <select
            className={styles.quizGenInput}
            value={answer}
            onChange={(e) => setAnswer(Number(e.target.value))}
            required
          >
            {options.map((opt, idx) => (
              <option key={idx} value={idx}>{`Correct: Option ${
                idx + 1
              }`}</option>
            ))}
          </select>
          {error && (
            <div
              style={{
                color: "#e11d48",
                marginBottom: "0.5rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                color: "#059669",
                marginBottom: "0.5rem",
                textAlign: "center",
              }}
            >
              {success}
            </div>
          )}
          <button
            className={styles.quizGenBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </form>
        <div className={styles.quizGenList}>
          {quizzes.length > 0 && (
            <h3 style={{ color: "#2563eb", marginBottom: 8 }}>
              Existing Quizzes
            </h3>
          )}
          {quizzes.map((q, i) => (
            <div className={styles.quizGenListItem} key={q._id || i}>
              <div className={styles.quizGenListTitle}>{q.question}</div>
              <ol className={styles.quizGenListOptions} type="A">
                {q.options &&
                  q.options.map((opt, idx) => (
                    <li
                      key={idx}
                      style={{
                        color: idx === q.answer ? "#059669" : undefined,
                      }}
                    >
                      {opt} {idx === q.answer && <b>(Correct)</b>}
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
