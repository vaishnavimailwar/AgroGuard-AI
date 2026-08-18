import { useEffect, useState } from "react";
import "./App.css";

import {
    getMissions,
    getMissionResults,
} from "./api";


function App() {

    const [missions, setMissions] = useState([]);

    const [missionResults, setMissionResults] = useState({});

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================================
    // FETCH MISSIONS
    // ==========================================================

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                setLoading(true);

                setError("");


                // ------------------------------------------------
                // Get missions
                // ------------------------------------------------

                const response = await getMissions();


                const missionData = Array.isArray(response.data)
                    ? response.data
                    : [response.data];


                setMissions(missionData);


                // ------------------------------------------------
                // Get results for every mission
                // ------------------------------------------------

                const resultsMap = {};


                await Promise.all(

                    missionData.map(async (mission) => {

                        try {

                            const resultResponse =
                                await getMissionResults(
                                    mission.id
                                );


                            resultsMap[mission.id] =
                                resultResponse.data;

                        } catch (resultError) {

                            console.error(
                                `Failed to fetch results for mission ${mission.id}:`,
                                resultError
                            );

                            resultsMap[mission.id] = null;

                        }

                    })

                );


                setMissionResults(resultsMap);


            } catch (err) {

                console.error(
                    "Failed to fetch dashboard data:",
                    err
                );


                setError(
                    "Unable to connect to AgroGuard backend."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchDashboardData();

    }, []);


    // ==========================================================
    // CALCULATE DETECTION COUNT
    // ==========================================================

    const getDetectionCount = (missionId) => {

        const result = missionResults[missionId];

        if (!result || !Array.isArray(result.results)) {
            return 0;
        }


        let count = 0;


        result.results.forEach((frame) => {

            if (Array.isArray(frame.detections)) {

                count += frame.detections.length;

            }

        });


        return count;

    };


    // ==========================================================
    // TOTAL MISSIONS
    // ==========================================================

    const totalMissions = missions.length;


    // ==========================================================
    // TOTAL DETECTIONS
    // ==========================================================

    const totalDetections = missions.reduce(

        (total, mission) => {

            return total +
                getDetectionCount(mission.id);

        },

        0

    );


    return (

        <div className="app">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="sidebar">


                <div className="logo">

                    <div className="logo-icon">
                        🌿
                    </div>


                    <div>

                        <h2>
                            AgroGuard AI
                        </h2>

                        <span>
                            Smart Agriculture
                        </span>

                    </div>

                </div>


                <nav className="navigation">


                    <button className="nav-item active">

                        <span>
                            ⌂
                        </span>

                        Dashboard

                    </button>


                    <button className="nav-item">

                        <span>
                            🚜
                        </span>

                        Farms

                    </button>


                    <button className="nav-item">

                        <span>
                            👨‍🌾
                        </span>

                        Farmers

                    </button>


                    <button className="nav-item">

                        <span>
                            🎯
                        </span>

                        Missions

                    </button>


                    <button className="nav-item">

                        <span>
                            📹
                        </span>

                        Video Analysis

                    </button>


                    <button className="nav-item">

                        <span>
                            📊
                        </span>

                        Detection Results

                    </button>


                </nav>


                <div className="sidebar-footer">

                    <span>
                        AgroGuard AI
                    </span>

                    <small>
                        UAV-Based Smart Agriculture System
                    </small>

                </div>


            </aside>


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="main-content">


                {/* ==================================================
                    TOP BAR
                ================================================== */}

                <header className="topbar">


                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Monitor your agricultural missions
                            and pest detection.
                        </p>

                    </div>


                    <div className="system-status">

                        <div className="status-dot"></div>

                        System Online

                    </div>


                </header>


                {/* ==================================================
                    WELCOME CARD
                ================================================== */}

                <section className="welcome-card">


                    <div>


                        <div className="eyebrow">

                            UAV AGRICULTURE MONITORING

                        </div>


                        <h2>

                            Welcome to AgroGuard AI

                        </h2>


                        <p>

                            Upload drone videos, detect
                            agricultural pests using AI,
                            and monitor your farm missions
                            from one dashboard.

                        </p>


                        <button className="primary-button">

                            + Create New Mission

                        </button>


                    </div>


                    <div className="drone-visual">

                        🚁

                    </div>


                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        style={{
                            padding: "12px 16px",
                            marginBottom: "20px",
                            borderRadius: "10px",
                            background: "#fff3f3",
                            color: "#c62828",
                            border: "1px solid #ffcdd2",
                        }}
                    >

                        {error}

                    </div>

                )}


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <section className="stats-grid">


                    {/* TOTAL FARMS */}

                    <div className="stat-card">

                        <div className="stat-icon">

                            🌾

                        </div>


                        <div>

                            <span>
                                Total Farms
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>

                    </div>


                    {/* FARMERS */}

                    <div className="stat-card">

                        <div className="stat-icon">

                            👨‍🌾

                        </div>


                        <div>

                            <span>
                                Farmers
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>

                    </div>


                    {/* TOTAL MISSIONS */}

                    <div className="stat-card">

                        <div className="stat-icon">

                            🎯

                        </div>


                        <div>

                            <span>
                                Total Missions
                            </span>


                            <strong>

                                {loading
                                    ? "..."
                                    : totalMissions}

                            </strong>

                        </div>

                    </div>


                    {/* TOTAL DETECTIONS */}

                    <div className="stat-card">

                        <div className="stat-icon">

                            🐛

                        </div>


                        <div>

                            <span>
                                Detections
                            </span>


                            <strong>

                                {loading
                                    ? "..."
                                    : totalDetections}

                            </strong>

                        </div>

                    </div>


                </section>


                {/* ==================================================
                    RECENT MISSIONS
                ================================================== */}

                <section className="section">


                    <div className="section-heading">


                        <div>

                            <h2>
                                Recent Missions
                            </h2>

                            <p>
                                Latest UAV monitoring missions
                            </p>

                        </div>


                        <button className="view-button">

                            View All

                        </button>


                    </div>


                    <div className="mission-table">


                        {/* TABLE HEADER */}

                        <div className="table-header">

                            <div>
                                Mission
                            </div>

                            <div>
                                Farm
                            </div>

                            <div>
                                Status
                            </div>

                            <div>
                                Detections
                            </div>

                        </div>


                        {/* LOADING */}

                        {loading && (

                            <div className="mission-row">


                                <div>

                                    <strong>
                                        Loading missions...
                                    </strong>

                                    <small>
                                        Connecting to backend
                                    </small>

                                </div>


                                <div>
                                    —
                                </div>


                                <div>
                                    —
                                </div>


                                <div>
                                    —
                                </div>


                            </div>

                        )}


                        {/* NO MISSIONS */}

                        {!loading &&
                            !error &&
                            missions.length === 0 && (

                                <div className="mission-row">


                                    <div>

                                        <strong>
                                            No missions yet
                                        </strong>

                                        <small>
                                            Create your first UAV
                                            monitoring mission
                                        </small>

                                    </div>


                                    <div>
                                        —
                                    </div>


                                    <div>
                                        —
                                    </div>


                                    <div>
                                        0
                                    </div>


                                </div>

                            )}


                        {/* REAL MISSIONS */}

                        {!loading &&

                            missions.map((mission) => (

                                <div
                                    className="mission-row"
                                    key={mission.id}
                                >


                                    {/* MISSION */}

                                    <div>

                                        <strong>

                                            {mission.mission_name}

                                        </strong>


                                        <small>

                                            Mission ID: {mission.id}

                                        </small>

                                    </div>


                                    {/* FARM */}

                                    <div>

                                        Farm {mission.farm_id}

                                    </div>


                                    {/* STATUS */}

                                    <div
                                        className={
                                            mission.status
                                                ?.toLowerCase() ===
                                            "completed"
                                                ? "completed"
                                                : ""
                                        }
                                    >

                                        ● {mission.status}

                                    </div>


                                    {/* DETECTIONS */}

                                    <div>

                                        {getDetectionCount(
                                            mission.id
                                        )}

                                    </div>


                                </div>

                            ))

                        }


                    </div>


                </section>


                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <section className="section">


                    <div className="section-heading">


                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Common operations
                            </p>

                        </div>


                    </div>


                    <div className="quick-actions">


                        {/* CREATE MISSION */}

                        <button className="action-card">


                            <span>
                                🎯
                            </span>


                            <div>

                                <strong>
                                    Create Mission
                                </strong>

                                <small>
                                    Start a new UAV mission
                                </small>

                            </div>


                        </button>


                        {/* UPLOAD VIDEO */}

                        <button className="action-card">


                            <span>
                                📹
                            </span>


                            <div>

                                <strong>
                                    Upload Video
                                </strong>

                                <small>
                                    Analyze drone footage
                                </small>

                            </div>


                        </button>


                        {/* VIEW RESULTS */}

                        <button className="action-card">


                            <span>
                                📊
                            </span>


                            <div>

                                <strong>
                                    View Results
                                </strong>

                                <small>
                                    Check AI detections
                                </small>

                            </div>


                        </button>


                    </div>


                </section>


            </main>


        </div>

    );

}


export default App;