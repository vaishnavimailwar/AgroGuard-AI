import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_BASE = "http://127.0.0.1:8000";

function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE}/admin/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Admin login failed"
                );
            }

            localStorage.setItem(
                "agroguard_admin",
                JSON.stringify({
                    role: data.role,
                    username,
                })
            );

            navigate("/admin");

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
        <div className="admin-auth-page">

            <header className="admin-auth-brand">
                <button onClick={() => navigate("/")}>
                    <img
                        src="/branding/agrogard-logo.png"
                        alt="AgroGuard-AI"
                    />

                    <strong>
                        AgroGuard<span>-AI</span>
                    </strong>
                </button>
            </header>

            <main className="admin-auth-layout">

                <section className="admin-auth-intro">

                    <div className="admin-auth-eyebrow">
                        AGROGUARD AI · ADMINISTRATION
                    </div>

                    <h1>
                        System
                        <br />
                        <em>control.</em>
                    </h1>

                    <p>
                        Secure access to farmer records,
                        agricultural missions, AI detection
                        results and system analytics.
                    </p>

                </section>

                <section className="admin-auth-card">

                    <div className="admin-auth-card-head">
                        <span>ADMIN</span>

                        <h2>Sign in</h2>

                        <p>
                            Enter your administrator credentials.
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>

                        <label>
                            Username

                            <input
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                placeholder="Administrator"
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
                                placeholder="Enter admin password"
                                required
                            />
                        </label>

                        {error && (
                            <div className="admin-auth-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="admin-auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Enter Admin Portal"}
                        </button>

                    </form>

                    <button
                        className="admin-auth-back"
                        onClick={() => navigate("/login")}
                    >
                        Farmer login
                    </button>

                </section>

            </main>

        </div>
    );
}

export default AdminLogin;
