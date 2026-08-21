import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const API_BASE = "http://127.0.0.1:8000";

function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        email: "",
        password: "",
        village: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSignup = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE}/farmers/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Registration failed"
                );
            }

            alert(
                "Farmer account created successfully. Please login."
            );

            navigate("/login");

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
        <div className="auth-page signup-page">

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
                        CREATE YOUR FARMER PROFILE
                    </div>

                    <h1>
                        Start your
                        <br />
                        <em>field journey.</em>
                    </h1>

                    <p>
                        Create your AgroGuard-AI account to
                        store your farm information and receive
                        personalised agricultural intelligence.
                    </p>

                </section>

                <section className="auth-card signup-card">

                    <div className="auth-card-head">

                        <span>01</span>

                        <h2>Create account</h2>

                        <p>
                            Tell us a little about yourself.
                        </p>

                    </div>

                    <form onSubmit={handleSignup}>

                        <label>
                            Full name

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                required
                            />
                        </label>

                        <label>
                            Email address

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="farmer@example.com"
                                required
                            />
                        </label>

                        <label>
                            Mobile number

                            <input
                                type="tel"
                                name="mobile"
                                value={form.mobile}
                                onChange={handleChange}
                                placeholder="+91 XXXXX XXXXX"
                                required
                            />
                        </label>

                        <label>
                            Village

                            <input
                                type="text"
                                name="village"
                                value={form.village}
                                onChange={handleChange}
                                placeholder="Village / locality"
                                required
                            />
                        </label>

                        <label>
                            Password

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create a password"
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
                                ? "Creating account..."
                                : "Create Farmer Account"}

                            {!loading && <span>→</span>}
                        </button>

                    </form>

                    <div className="auth-switch">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            onClick={() => navigate("/login")}
                        >
                            Login
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

export default Signup;