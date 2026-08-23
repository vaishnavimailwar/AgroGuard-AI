import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = "https://agroguard-ai-ak4o.onrender.com";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE}/farmers/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Login failed"
                );
            }

            localStorage.setItem(
                "agroguard_farmer",
                JSON.stringify(data)
            );

            navigate("/dashboard");

        } catch (err) {
            setError(
                err.message ||
                "Unable to connect to AgroGuard-AI."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-brand">
                <button onClick={() => navigate("/")}>
                    <img
                        src="/branding/agrogard-logo.png"
                        alt="AgroGuard-AI"
                    />

                    <strong>
                        AgroGuard<span>-AI</span>
                    </strong>
                </button>
            </div>

            <main className="auth-layout">

                <section className="auth-intro">

                    <div className="auth-eyebrow">
                        FARMER INTELLIGENCE PORTAL
                    </div>

                    <h1>
                        Welcome
                        <br />
                        <em>back.</em>
                    </h1>

                    <p>
                        Access your fields, crop intelligence,
                        detection results and agricultural
                        advisories from one place.
                    </p>

                </section>

                <section className="auth-card">

                    <div className="auth-card-head">
                        <span>01</span>

                        <h2>Sign in</h2>

                        <p>
                            Enter your farmer account details.
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>

                        <label>
                            Email address

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="farmer@example.com"
                                required
                            />
                        </label>

                        <label>
                            Password

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                required
                            />
                        </label>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Login"}

                            {!loading && <span>→</span>}
                        </button>

                    </form>

                    <div className="auth-switch">

                        <span>
                            New to AgroGuard-AI?
                        </span>

                        <button
                            onClick={() => navigate("/signup")}
                        >
                            Create farmer account
                        </button>

                    </div>

                </section>

            </main>

            <button
                className="auth-back"
                onClick={() => navigate("/portal")}
            >
                ← Back to portal
            </button>

        </div>
    );
}

export default Login;
