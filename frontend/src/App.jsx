import { useEffect, useState } from "react";
import "./App.css";

import { getMissions } from "./api";

function App() {
    const [missions, setMissions] = useState([]);

    useEffect(() => {
        getMissions()
            .then((response) => {
                setMissions(response.data);
            })
            .catch((error) => {
                console.error("Failed to fetch missions:", error);
            });
    }, []);
    return (
        <div className="app">

            {/* SIDEBAR */}
            <aside className="sidebar">

                <div className="logo">

                    <div className="logo-icon">🌿</div>

                    <div>
                        <h2>AgroGuard AI</h2>
                        <span>Smart Agriculture</span>
                    </div>
                </div>

                <nav className="navigation">

                    <button className="nav-item active">
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button className="nav-item">
                        <span>🚜</span>
                        Farms
                    </button>

                    <button className="nav-item">
                        <span>👨‍🌾</span>
                        Farmers
                    </button>

                    <button className="nav-item">
                        <span>🎯</span>
                        Missions
                    </button>

                    <button className="nav-item">
                        <span>📹</span>
                        Video Analysis
                    </button>

                    <button className="nav-item">
                        <span>📊</span>
                        Detection Results
                    </button>

                </nav>

                <div className="sidebar-footer">
                    <span>AgroGuard AI</span>
                    <small>UAV-Based Smart Agriculture System</small>
                </div>

            </aside>


            {/* MAIN CONTENT */}
            <main className="main-content">

                {/* TOP BAR */}
                <header className="topbar">

                    <div>
                        <h1>Dashboard</h1>
                        <p>Monitor your agricultural missions and pest detection.</p>
                    </div>

                    <div className="system-status">
                        <div className="status-dot"></div>
                        System Online
                    </div>

                </header>


                {/* WELCOME CARD */}
                <section className="welcome-card">

                    <div>

                        <div className="eyebrow">
                            UAV AGRICULTURE MONITORING
                        </div>

                        <h2>
                            Welcome to AgroGuard AI
                        </h2>

                        <p>
                            Upload drone videos, detect agricultural pests using AI,
                            and monitor your farm missions from one dashboard.
                        </p>

                        <button className="primary-button">
                            + Create New Mission
                        </button>

                    </div>

                    <div className="drone-visual">
                        🚁
                    </div>

                </section>


                {/* STATISTICS */}
                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            🌾
                        </div>

                        <div>
                            <span>Total Farms</span>
                            <strong>0</strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            👨‍🌾
                        </div>

                        <div>
                            <span>Farmers</span>
                            <strong>0</strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            🎯
                        </div>

                        <div>
                            <span>Total Missions</span>
                            <strong>2</strong>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            🐜
                        </div>

                        <div>
                            <span>Detections</span>
                            <strong>10</strong>
                        </div>

                    </div>

                </section>


                {/* MISSIONS */}
                <section className="section">

                    <div className="section-heading">

                        <div>
                            <h2>Recent Missions</h2>
                            <p>Latest UAV monitoring missions</p>
                        </div>

                        <button className="view-button">
                            View All
                        </button>

                    </div>


                    <div className="mission-table">

                        <div className="table-header">
                            <div>Mission</div>
                            <div>Farm</div>
                            <div>Status</div>
                            <div>Detections</div>
                        </div>


                        <div className="mission-row">

                            <div>
                                <strong>Test Mission 1</strong>
                                <small>Mission ID: 1</small>
                            </div>

                            <div>
                                Farm 1
                            </div>

                            <div className="completed">
                                ● Completed
                            </div>

                            <div>
                                10
                            </div>

                        </div>


                        <div className="mission-row">

                            <div>
                                <strong>Test Mission 2</strong>
                                <small>Mission ID: 2</small>
                            </div>

                            <div>
                                Farm 1
                            </div>

                            <div className="completed">
                                ● Completed
                            </div>

                            <div>
                                10
                            </div>

                        </div>

                    </div>

                </section>


                {/* QUICK ACTIONS */}
                <section className="section">

                    <div className="section-heading">

                        <div>
                            <h2>Quick Actions</h2>
                            <p>Common operations</p>
                        </div>

                    </div>


                    <div className="quick-actions">

                        <button className="action-card">

                            <span>🎯</span>

                            <div>
                                <strong>Create Mission</strong>
                                <small>Start a new UAV mission</small>
                            </div>

                        </button>


                        <button className="action-card">

                            <span>📹</span>

                            <div>
                                <strong>Upload Video</strong>
                                <small>Analyze drone footage</small>
                            </div>

                        </button>


                        <button className="action-card">

                            <span>📊</span>

                            <div>
                                <strong>View Results</strong>
                                <small>Check AI detections</small>
                            </div>

                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default App;