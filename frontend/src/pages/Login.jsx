import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "../api";

// Login page for QuizBuddy
export default function Login() {
  // State for form fields and UI
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user"); // user or admin
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Send login request to backend
      const res = await axios.post("/auth/login", { username, password, role });
      if (res.token || (res.data && res.data.token)) {
        const token = res.token || res.data.token;
        // Store user info in localStorage for profile page
        const user = res.user || (res.data && res.data.user) || {};
        // Use username as email fallback (since backend does not return email)
        localStorage.setItem(
          "user",
          JSON.stringify({ id: user.id, email: user.username || username })
        );
        localStorage.setItem("token", token);
        // Redirect based on role
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        setError("Invalid response from server: " + JSON.stringify(res));
      }
    } catch (err) {
      // Show error message if login fails
      setError(
        (err.response &&
          (err.response.data?.message || JSON.stringify(err.response.data))) ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div
      className="test-bg"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      {/* App logo and name */}
      <div className="test-logo">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="24" height="24" rx="6" fill="#2563eb" />
          <circle cx="14" cy="14" r="7" fill="#fff" />
          <circle cx="14" cy="14" r="3.5" fill="#2563eb" />
        </svg>
        QuizBuddy
      </div>
      {/* Decorative clouds background */}
      <svg
        className="test-clouds"
        width="100%"
        height="100%"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 700 Q720 400 1440 700"
          stroke="#eaf6ff"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0 600 Q720 300 1440 600"
          stroke="#eaf6ff"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0 500 Q720 200 1440 500"
          stroke="#eaf6ff"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      {/* Login form card */}
      <div className="test-card">
        <div className="test-icon">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="28" height="28" rx="14" fill="#f7fafd" />
            <path
              d="M9 14h10M14 9v10"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="test-title">Sign in with User ID</div>
        <div className="test-desc">
          Sign in to access quizzes, chat, and manage your QuizBuddy account.
        </div>
        <form className="test-form" onSubmit={handleSubmit}>
          <div className="test-input-group">
            <select
              className="test-input"
              style={{
                paddingLeft: "1rem",
                paddingRight: "1rem",
                color: "#2563eb",
              }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="test-input-group">
            <input
              className="test-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="test-input-group">
            <span className="test-input-icon">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              className="test-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="test-input-eye"
              onClick={() => setShowPassword((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#b0b0c3"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#b0b0c3"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06M1 1l22 22" />
                  <path d="M9.53 9.53A3.001 3.001 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                </svg>
              )}
            </span>
          </div>
          <div className="test-row">
            <div></div>
            <a className="test-link" href="#">
              Forgot password?
            </a>
          </div>
          {error && (
            <div
              style={{
                color: "red",
                marginBottom: "0.5rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          <button className="test-btn" type="submit">
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
