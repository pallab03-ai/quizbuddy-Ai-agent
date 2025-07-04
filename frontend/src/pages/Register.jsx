import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./register.css";

// Registration page for new users (User/Admin)
export default function Register() {
  // State variables for form fields and UI feedback
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState("user");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Handles form submission for registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Basic validation
    if (!email || !username || !password || !repeatPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to the terms and conditions.");
      return;
    }
    setLoading(true);
    try {
      // Send registration data to backend
      const res = await api.post("/auth/register", {
        email,
        username,
        password,
        role,
      });
      // Store user info in localStorage for profile page (simulate login after register)
      if (res && res.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({ id: res.user.id, email: email })
        );
      }
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      // Reset form fields
      setEmail("");
      setUsername("");
      setPassword("");
      setRepeatPassword("");
      setRole("user");
      setAgree(false);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <div className="register-card">
        <div className="register-title">Create your QuizBuddy account</div>
        <div className="register-desc">
          Sign up to access quizzes, chat, and more.
        </div>
        {/* Registration form */}
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="register-input-group">
            <input
              type="email"
              id="email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
              placeholder="Enter email"
              required
            />
          </div>
          {/* Username input */}
          <div className="register-input-group">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="register-input"
              placeholder="Enter username"
              required
            />
          </div>
          {/* Password input */}
          <div className="register-input-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input"
              placeholder="Password"
              required
            />
          </div>
          {/* Repeat password input */}
          <div className="register-input-group">
            <input
              type="password"
              id="repeat-password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="register-input"
              placeholder="Repeat password"
              required
            />
          </div>
          {/* Role selection (User/Admin) */}
          <div className="register-input-group">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="register-input"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {/* Terms and conditions checkbox */}
          <div
            className="register-input-group"
            style={{ justifyContent: "flex-start" }}
          >
            <input
              id="terms"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ width: "18px", height: "18px", marginRight: "8px" }}
              required
            />
            <label
              htmlFor="terms"
              style={{
                fontSize: "0.98rem",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              I agree with the{" "}
              <a
                href="#"
                style={{ color: "#1e40af", textDecoration: "underline" }}
              >
                terms and conditions
              </a>
            </label>
          </div>
          {/* Error and success messages */}
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
          {/* Submit button */}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register new account"}
          </button>
        </form>
      </div>
    </div>
  );
}
