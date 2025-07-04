import React from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  // Simulate user info from localStorage (replace with real user info if available)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || "Unknown";
  const email = user.email || "Unknown";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="quizGenBg">
      <div
        className="quizGenCard"
        style={{
          maxWidth: 400,
          width: "100%",
          margin: "60px auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
        }}
      >
        <div className="quizGenTitle">Profile</div>
        <div style={{ fontSize: 18, margin: "24px 0" }}>
          <div>
            <b>User ID:</b> {userId}
          </div>
          <div style={{ marginTop: 12 }}>
            <b>Email:</b> {email}
          </div>
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <button
            className="quizGenBtn"
            style={{
              width: 180,
              fontSize: 17,
              background: "#e11d48",
              color: "#fff",
              borderRadius: 12,
              fontWeight: 700,
              margin: "0 auto",
            }}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
