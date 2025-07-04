import "./Landing.css";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-bg relative min-h-screen bg-gray-100 overflow-hidden">
      {/* Subtle grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >
        <svg
          width="100%"
          height="100%"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 0 L 0 40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <path
                d="M 0 0 L 40 0"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <header className="landing-header">
        <div className="logo text-4xl font-extrabold select-none flex items-center gap-2">
          {/* Simple logo icon before QuizBuddy */}
          <svg
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="4" y="4" width="30" height="30" rx="8" fill="#2563eb" />
            <circle cx="19" cy="19" r="8" fill="white" />
            <circle cx="19" cy="19" r="4" fill="#2563eb" />
          </svg>
          <span
            className="text-blue-600"
            style={{ fontSize: "2.7rem", fontWeight: 800 }}
          >
            Quiz
          </span>
          <span
            className="text-black"
            style={{ fontSize: "2.7rem", fontWeight: 800 }}
          >
            Buddy
          </span>
        </div>
        <nav className="flex gap-2">
          <Link
            to="/login"
            className="sign-in px-5 py-2 rounded-lg font-semibold bg-white hover:bg-gray-100 transition-all"
            style={{
              minWidth: "120px",
              textAlign: "center",
              border: "none",
              boxShadow: "none",
            }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="get-demo px-5 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
            style={{
              minWidth: "120px",
              textAlign: "center",
              border: "none",
              boxShadow: "none",
              outline: "none",
            }}
          >
            Sign up
          </Link>
        </nav>
      </header>
      <main className="landing-main">
        {/* Removed sticky note card */}
        {/* Removed reminders card */}
        {/* Removed today's tasks card */}
        {/* Removed integrations card */}
        <div className="center-content" style={{ marginTop: "-120px" }}>
          <div className="center-icon"></div>
          <h1 className="animate-fade-in-up text-4xl md:text-6xl font-bold mb-4">
            <span className="block">Master Your Day</span>
            <span className="highlight block animate-fade-in-up-delay">
              with Effortless Productivity
            </span>
          </h1>
          <p className="subhead">
            Organize, prioritize, and achieve more—smarter, faster, together.
          </p>
          <Link to="/register" className="cta-btn">
            Get demo
          </Link>
        </div>
        {/* Animation styles for headline */}
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
          }
          .animate-fade-in-up-delay {
            animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
            animation-delay: 0.5s;
          }
        `}</style>
      </main>
    </div>
  );
}
