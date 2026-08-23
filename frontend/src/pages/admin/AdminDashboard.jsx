import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE = "http://127.0.0.1:8000";

function AdminDashboard() {
    const navigate = useNavigate();

    const [overview, setOverview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/admin/overview`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load admin overview"
                    );
                }

                setOverview(data);

            } catch (err) {
                setError(
                    err.message ||
                    "Unable to connect to AgroGuard-AI backend."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("agroguard_admin");
        navigate("/admin/login");
    };

    return (
        <div className="admin-dashboard">

            <aside className="admin-sidebar">

                <div className="admin-sidebar-brand">
                    <img
                        src="/branding/agrogard-logo.png"
                        alt="AgroGuard-AI"
                    />

                    <div>
                        <strong>AgroGuard-AI</strong>
                        <span>Administration</span>
                    </div>
                </div>

                <nav className="admin-navigation">

                    <button className="admin-nav-item active">
                        Dashboard
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin/farmers")}
                    >
                        Farmers
                    </button>

                    <button className="admin-nav-item">
                        Farms
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin/missions")}
                    >
                        Missions
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin/ai-results")}
                    >
                        AI Results
                    </button>

                    <button className="admin-nav-item">
                        Advisories
                    </button>

                </nav>

                <div className="admin-sidebar-bottom">

                    <div className="admin-access-label">
                        ADMIN ACCESS
                    </div>

                    <button
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>

                </div>

            </aside>

            <main className="admin-main">

                <header className="admin-header">

                    <div>
                        <div className="admin-eyebrow">
                            AGROGUARD AI · ADMINISTRATION
                        </div>

                        <h1>System Dashboard</h1>

                        <p>
                            Monitor farmers, agricultural missions,
                            AI detections and system activity.
                        </p>
                    </div>

                    <div className="admin-status">
                        <span></span>
                        System Online
                    </div>

                </header>

                {error && (
                    <div className="admin-auth-error">
                        {error}
                    </div>
                )}

                <section className="admin-stat-grid">

                    <div className="admin-stat-card">
                        <span>Total Farmers</span>

                        <strong>
                            {loading ? "—" : overview?.farmers ?? 0}
                        </strong>

                        <small>
                            Registered farmers
                        </small>
                    </div>

                    <div className="admin-stat-card">
                        <span>Total Farms</span>

                        <strong>
                            {loading ? "—" : overview?.farms ?? 0}
                        </strong>

                        <small>
                            Registered agricultural farms
                        </small>
                    </div>

                    <div className="admin-stat-card">
                        <span>Total Missions</span>

                        <strong>
                            {loading ? "—" : overview?.missions ?? 0}
                        </strong>

                        <small>
                            UAV monitoring missions
                        </small>
                    </div>

                    <div className="admin-stat-card">
                        <span>AI Detection Frames</span>

                        <strong>
                            {
                                loading
                                    ? "—"
                                    : overview?.detection_frames ?? 0
                            }
                        </strong>

                        <small>
                            Frames containing detections
                        </small>
                    </div>

                </section>

                <section className="admin-content-grid">

                    <div className="admin-panel">

                        <div className="admin-panel-heading">

                            <div>
                                <h2>Recent Missions</h2>

                                <p>
                                    Latest agricultural monitoring activity
                                </p>
                            </div>

                        </div>

                        {!loading &&
                            overview?.recent_missions?.length > 0 ? (

                            <div className="admin-mission-list">

                                {overview.recent_missions.map(
                                    (mission) => (

                                        <div
                                            className="admin-mission-item"
                                            key={mission.id}
                                        >

                                            <div>
                                                <strong>
                                                    {mission.name}
                                                </strong>

                                                <span>
                                                    Mission #{mission.id}
                                                </span>
                                            </div>

                                            <div className="admin-mission-meta">

                                                <span
                                                    className={
                                                        mission.has_ai_results
                                                            ? "mission-ai-ready"
                                                            : "mission-ai-pending"
                                                    }
                                                >
                                                    {
                                                        mission.has_ai_results
                                                            ? "AI processed"
                                                            : "Pending AI"
                                                    }
                                                </span>

                                                <span>
                                                    {mission.status}
                                                </span>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        ) : (

                            <div className="admin-empty-state">

                                <strong>
                                    {loading
                                        ? "Loading missions..."
                                        : "No mission data yet"}
                                </strong>

                                <span>
                                    Mission records will appear here
                                    when farmers create missions.
                                </span>

                            </div>
                        )}

                    </div>

                    <div className="admin-panel">

                        <div className="admin-panel-heading">

                            <div>
                                <h2>AI Activity</h2>

                                <p>
                                    Current detection intelligence
                                </p>
                            </div>

                        </div>

                        {loading ? (

                            <div className="admin-empty-state">
                                <strong>
                                    Loading AI data...
                                </strong>
                            </div>

                        ) : (

                            <div className="admin-ai-summary">

                                <div>
                                    <span>
                                        Processed missions
                                    </span>

                                    <strong>
                                        {overview?.processed_missions ?? 0}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Pest classes
                                    </span>

                                    <strong>
                                        {overview?.pest_classes?.length ?? 0}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Average confidence
                                    </span>

                                    <strong>
                                        {
                                            overview?.average_confidence != null
                                                ? `${(
                                                    overview.average_confidence *
                                                    100
                                                ).toFixed(1)}%`
                                                : "N/A"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Detected classes
                                    </span>

                                    <strong>
                                        {
                                            overview?.pest_classes?.length
                                                ? overview.pest_classes.join(", ")
                                                : "None"
                                        }
                                    </strong>
                                </div>

                            </div>

                        )}

                    </div>

                </section>

                <section className="admin-data-panel">

                    <div className="admin-panel-heading">

                        <div>
                            <h2>System Data</h2>

                            <p>
                                Administrative access to AgroGuard-AI records.
                            </p>
                        </div>

                    </div>

                    <div className="admin-data-row">

                        <div>
                            <strong>
                                Farmer information
                            </strong>

                            <span>
                                View registered farmer accounts and profiles.
                            </span>
                        </div>

                        <div>
                            <strong>
                                Mission records
                            </strong>

                            <span>
                                Review UAV missions and processing status.
                            </span>
                        </div>

                        <div>
                            <strong>
                                AI results
                            </strong>

                            <span>
                                Review pest detections, confidence and severity.
                            </span>
                        </div>

                        <div>
                            <strong>
                                Spray advisories
                            </strong>

                            <span>
                                Review generated agricultural recommendations.
                            </span>
                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;