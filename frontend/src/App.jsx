import { useEffect, useState } from "react";
import "./App.css";

import {
    getMissions,
    createMission,
    uploadVideo,
    getMissionResults,
    downloadMissionReport,
} from "./api";


function App() {

    // ==========================================================
    // STATE
    // ==========================================================

    const [missions, setMissions] = useState([]);

    const [missionResults, setMissionResults] = useState({});

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [activePage, setActivePage] = useState("dashboard");

    const [selectedMissionId, setSelectedMissionId] = useState(null);

    // Video upload state
    const [selectedFile, setSelectedFile] = useState(null);

    const [selectedUploadMission, setSelectedUploadMission] =
        useState("");

    const [uploading, setUploading] = useState(false);

    const [uploadMessage, setUploadMessage] = useState("");

    // Create mission state
    const [missionName, setMissionName] = useState("");

    const [creatingMission, setCreatingMission] = useState(false);


    // ==========================================================
    // LOAD MISSIONS
    // ==========================================================

    const loadMissions = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await getMissions();

            const missionData = Array.isArray(response.data)
                ? response.data
                : [response.data];

            setMissions(missionData);

            if (
                missionData.length > 0 &&
                selectedMissionId === null
            ) {

                setSelectedMissionId(
                    missionData[0].id
                );

            }

            if (
                missionData.length > 0 &&
                selectedUploadMission === ""
            ) {

                setSelectedUploadMission(
                    String(missionData[0].id)
                );

            }

            // Load results
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

                        console.log(
                            `No results yet for mission ${mission.id}`
                        );

                    }

                })

            );

            setMissionResults(resultsMap);

        } catch (fetchError) {

            console.error(fetchError);

            setError(
                "Unable to connect to AgroGuard AI backend."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        loadMissions();

    }, []);


    // ==========================================================
    // CALCULATIONS
    // ==========================================================

    const totalMissions = missions.length;


    const totalDetections =
        Object.values(missionResults).reduce(
            (total, mission) => {

                if (
                    !mission ||
                    !Array.isArray(mission.results)
                ) {

                    return total;

                }

                return total +
                    mission.results.reduce(
                        (count, frame) => {

                            if (
                                !Array.isArray(
                                    frame.detections
                                )
                            ) {

                                return count;

                            }

                            return count +
                                frame.detections.length;

                        },
                        0
                    );

            },
            0
        );


    const totalFarms =
        new Set(
            missions
                .map(
                    (mission) =>
                        mission.farm_id
                )
                .filter(Boolean)
        ).size;


    const totalFarmers =
        new Set(
            missions
                .map(
                    (mission) =>
                        mission.farmer_id
                )
                .filter(Boolean)
        ).size;


    // ==========================================================
    // SELECTED MISSION
    // ==========================================================

    const selectedMission =
        missions.find(
            (mission) =>
                mission.id ===
                Number(selectedMissionId)
        );


    const selectedResults =
        selectedMissionId !== null
            ? missionResults[selectedMissionId]
            : null;


    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const handleNavigation = (page) => {

        setActivePage(page);

        setError("");

        setUploadMessage("");

    };


    // ==========================================================
    // CREATE NEW MISSION
    // ==========================================================

    const handleCreateMission = async () => {

        if (!missionName.trim()) {

            setError(
                "Please enter a mission name."
            );

            return;

        }

        try {

            setCreatingMission(true);

            setError("");

            const response =
                await createMission({

                    mission_name:
                        missionName.trim(),

                    farm_id: 1,

                    farmer_id: 1,

                });


            const newMissionId =
                response.data.id;


            setMissionName("");

            setUploadMessage(
                `Mission ${newMissionId} created successfully.`
            );


            await loadMissions();


            setSelectedMissionId(
                newMissionId
            );

            setSelectedUploadMission(
                String(newMissionId)
            );

            setActivePage("video");


        } catch (createError) {

            console.error(
                "Mission creation failed:",
                createError
            );

            setError(
                createError.response?.data?.detail ||
                "Failed to create mission."
            );

        } finally {

            setCreatingMission(false);

        }

    };


    // ==========================================================
    // VIDEO FILE SELECT
    // ==========================================================

    const handleFileChange = (event) => {

        const file =
            event.target.files?.[0];

        if (!file) {

            setSelectedFile(null);

            return;

        }

        setSelectedFile(file);

        setUploadMessage("");

        setError("");

    };


    // ==========================================================
    // UPLOAD VIDEO
    // ==========================================================

    const handleUploadVideo = async () => {

        if (!selectedUploadMission) {

            setError(
                "Please select a mission."
            );

            return;

        }

        if (!selectedFile) {

            setError(
                "Please select a video file."
            );

            return;

        }


        try {

            setUploading(true);

            setError("");

            setUploadMessage(
                "Uploading video and running AI detection..."
            );


            const response =
                await uploadVideo(
                    Number(selectedUploadMission),
                    selectedFile
                );


            console.log(
                "Video upload response:",
                response.data
            );


            setUploadMessage(
                `Video processed successfully. ${response.data.detections} detections found.`
            );


            setSelectedFile(null);


            // Refresh missions and results
            await loadMissions();


            setSelectedMissionId(
                Number(selectedUploadMission)
            );


            // Go directly to results
            setActivePage("results");


        } catch (uploadError) {

            console.error(
                "Video upload failed:",
                uploadError
            );


            setError(
                uploadError.response?.data?.detail ||
                "Video processing failed."
            );

            setUploadMessage("");

        } finally {

            setUploading(false);

        }

    };


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="app">

                <aside className="sidebar">

                    <div className="logo">

                        <div className="logo-icon">🌿</div>

                        <div>

                            <h2>
                                AgroGuard AI
                            </h2>

                            <span>
                                Smart Agriculture
                            </span>

                        </div>

                    </div>

                </aside>


                <main className="main-content">

                    <div
                        style={{
                            padding: "60px",
                            textAlign: "center"
                        }}
                    >

                        <h2>
                            Loading AgroGuard AI...
                        </h2>

                        <p>
                            Connecting to backend and loading missions.
                        </p>

                    </div>

                </main>

            </div>

        );

    }


    // ==========================================================
    // DASHBOARD
    // ==========================================================

    const DashboardPage = () => (

        <>

            <header className="topbar">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Monitor your agricultural missions and pest detection.
                    </p>

                </div>


                <div className="system-status">

                    <div className="status-dot"></div>

                    System Online

                </div>

            </header>


            {error && (

                <div
                    style={{
                        padding: "15px",
                        marginBottom: "20px",
                        background: "#ffecec",
                        borderRadius: "10px",
                        color: "#b00020"
                    }}
                >

                    {error}

                </div>

            )}


            <section className="welcome-card">

                <div>

                    <div className="eyebrow">
                        UAV AGRICULTURE MONITORING
                    </div>

                    <h2>
                        Welcome to AgroGuard AI
                    </h2>

                    <p>
                        Upload drone videos, detect agricultural pests
                        using AI, and monitor your farm missions from
                        one dashboard.
                    </p>


                    <button
                        className="primary-button"
                        onClick={() =>
                            setActivePage("missions")
                        }
                    >
                        + Create New Mission
                    </button>

                </div>


                <div className="drone-visual">🚁</div>

            </section>


            <section className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon">🌿</div>

                    <div>

                        <span>
                            Total Farms
                        </span>

                        <strong>
                            {totalFarms}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">🌿</div>

                    <div>

                        <span>
                            Farmers
                        </span>

                        <strong>
                            {totalFarmers}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">🌿</div>

                    <div>

                        <span>
                            Total Missions
                        </span>

                        <strong>
                            {totalMissions}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">🌿</div>

                    <div>

                        <span>
                            Detections
                        </span>

                        <strong>
                            {totalDetections}
                        </strong>

                    </div>

                </div>

            </section>


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


                    <button
                        className="view-button"
                        onClick={() =>
                            setActivePage("missions")
                        }
                    >
                        View All
                    </button>

                </div>


                <div className="mission-table">

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


                    {missions.length === 0 ? (

                        <div className="mission-row">

                            <div>
                                No missions available.
                            </div>

                        </div>

                    ) : (

                        missions
                            .slice(0, 5)
                            .map((mission) => {

                                const result =
                                    missionResults[
                                        mission.id
                                    ];


                                const detections =
                                    result &&
                                    Array.isArray(
                                        result.results
                                    )
                                        ? result.results.reduce(
                                            (
                                                count,
                                                frame
                                            ) =>
                                                count +
                                                (
                                                    Array.isArray(
                                                        frame.detections
                                                    )
                                                        ? frame.detections.length
                                                        : 0
                                                ),
                                            0
                                        )
                                        : 0;


                                return (

                                    <div
                                        className="mission-row"
                                        key={mission.id}
                                    >

                                        <div>

                                            <strong>
                                                {
                                                    mission.mission_name
                                                }
                                            </strong>

                                            <small>
                                                Mission ID:{" "}
                                                {
                                                    mission.id
                                                }
                                            </small>

                                        </div>


                                        <div>
                                            Farm{" "}
                                            {
                                                mission.farm_id
                                            }
                                        </div>


                                        <div className="completed">

                                            •{" "}
                                            {
                                                mission.status
                                            }

                                        </div>


                                        <div>
                                            {detections}
                                        </div>

                                    </div>

                                );

                            })

                    )}

                </div>

            </section>


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

                    <button
                        className="action-card"
                        onClick={() =>
                            setActivePage("missions")
                        }
                    >

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


                    <button
                        className="action-card"
                        onClick={() =>
                            setActivePage("video")
                        }
                    >

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


                    <button
                        className="action-card"
                        onClick={() =>
                            setActivePage("results")
                        }
                    >

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

        </>

    );


    // ==========================================================
    // MISSIONS PAGE
    // ==========================================================

    const MissionsPage = () => (

        <>

            <header className="topbar">

                <div>

                    <h1>
                        Missions
                    </h1>

                    <p>
                        Create and manage UAV monitoring missions.
                    </p>

                </div>


                <div className="system-status">

                    <div className="status-dot"></div>

                    System Online

                </div>

            </header>


            {error && (

                <div
                    style={{
                        padding: "15px",
                        marginBottom: "20px",
                        background: "#ffecec",
                        borderRadius: "10px",
                        color: "#b00020"
                    }}
                >

                    {error}

                </div>

            )}


            <section className="section">

                <div
                    style={{
                        padding: "25px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        marginBottom: "25px"
                    }}
                >

                    <h2>
                        Create New Mission
                    </h2>

                    <p>
                        Create a UAV mission before uploading drone footage.
                    </p>


                    <input
                        type="text"
                        placeholder="Enter mission name"
                        value={missionName}
                        onChange={(event) =>
                            setMissionName(
                                event.target.value
                            )
                        }
                        style={{
                            padding: "12px",
                            width: "60%",
                            marginRight: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ccc"
                        }}
                    />


                    <button
                        className="primary-button"
                        onClick={
                            handleCreateMission
                        }
                        disabled={creatingMission}
                    >

                        {creatingMission
                            ? "Creating..."
                            : "Create Mission"
                        }

                    </button>

                </div>


                <div className="mission-table">

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


                    {missions.map((mission) => {

                        const result =
                            missionResults[
                                mission.id
                            ];


                        const detections =
                            result &&
                            Array.isArray(
                                result.results
                            )
                                ? result.results.reduce(
                                    (
                                        count,
                                        frame
                                    ) =>
                                        count +
                                        (
                                            Array.isArray(
                                                frame.detections
                                            )
                                                ? frame.detections.length
                                                : 0
                                        ),
                                    0
                                )
                                : 0;


                        return (

                            <div
                                className="mission-row"
                                key={mission.id}
                            >

                                <div>

                                    <strong>
                                        {
                                            mission.mission_name
                                        }
                                    </strong>

                                    <small>
                                        Mission ID:{" "}
                                        {
                                            mission.id
                                        }
                                    </small>

                                </div>


                                <div>
                                    Farm{" "}
                                    {
                                        mission.farm_id
                                    }
                                </div>


                                <div className="completed">

                                    •{" "}
                                    {
                                        mission.status
                                    }

                                </div>


                                <div>
                                    {detections}
                                </div>

                            </div>

                        );

                    })}

                </div>

            </section>

        </>

    );


    // ==========================================================
    // VIDEO ANALYSIS PAGE
    // ==========================================================

    const VideoPage = () => (

        <>

            <header className="topbar">

                <div>

                    <h1>
                        Video Analysis
                    </h1>

                    <p>
                        Upload UAV footage for AI pest detection.
                    </p>

                </div>


                <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "15px"
    }}
>

    <div className="system-status">

        <div className="status-dot"></div>

        AI System Online

    </div>



</div>

            </header>


            {error && (

                <div
                    style={{
                        padding: "15px",
                        marginBottom: "20px",
                        background: "#ffecec",
                        borderRadius: "10px",
                        color: "#b00020"
                    }}
                >

                    {error}

                </div>

            )}


            {uploadMessage && (

                <div
                    style={{
                        padding: "15px",
                        marginBottom: "20px",
                        background: "#f1f8ee",
                        borderRadius: "10px",
                        color: "#216e39"
                    }}
                >

                    {uploadMessage}

                </div>

            )}


            <section className="section">

                <div
                    style={{
                        padding: "35px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0"
                    }}
                >

                    <h2>
                        Upload Drone Video
                    </h2>

                    <p>
                        Select the mission and upload the UAV video.
                    </p>


                    {/* MISSION */}

                    <div
                        style={{
                            marginTop: "25px",
                            marginBottom: "20px"
                        }}
                    >

                        <label>
                            <strong>
                                Select Mission
                            </strong>
                        </label>


                        <br />


                        <select
                            value={
                                selectedUploadMission
                            }
                            onChange={(event) =>
                                setSelectedUploadMission(
                                    event.target.value
                                )
                            }
                            style={{
                                padding: "12px",
                                marginTop: "8px",
                                width: "100%",
                                maxWidth: "500px",
                                borderRadius: "8px",
                                border: "1px solid #ccc"
                            }}
                        >

                            <option value="">
                                Select a mission
                            </option>


                            {missions.map(
                                (mission) => (

                                    <option
                                        key={mission.id}
                                        value={mission.id}
                                    >

                                        {
                                            mission.mission_name
                                        }

                                        {" "}
                                        (ID:{" "}
                                        {
                                            mission.id
                                        })

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* FILE */}

                    <div
                        style={{
                            marginBottom: "25px"
                        }}
                    >

                        <label>
                            <strong>
                                Select Video
                            </strong>
                        </label>


                        <br />


                        <input
                            type="file"
                            accept="video/*"
                            onChange={
                                handleFileChange
                            }
                            style={{
                                marginTop: "10px"
                            }}
                        />


                        {selectedFile && (

                            <p>

                                Selected:
                                {" "}
                                <strong>
                                    {
                                        selectedFile.name
                                    }
                                </strong>

                            </p>

                        )}

                    </div>


                    {/* UPLOAD BUTTON */}

                    <button
                        className="primary-button"
                        onClick={
                            handleUploadVideo
                        }
                        disabled={uploading}
                    >

                        {uploading
                            ? "Processing Video..."
                            : "Upload & Analyze Video"
                        }

                    </button>


                    {uploading && (

                        <p
                            style={{
                                marginTop: "15px"
                            }}
                        >

                            ⏳ AI is extracting frames and
                            running pest detection. Please wait...

                        </p>

                    )}

                </div>

            </section>


            {/* WORKFLOW */}

            <section className="section">

                <div
                    style={{
                        padding: "25px",
                        background: "#f1f8ee",
                        borderRadius: "12px",
                        border: "1px solid #dcebd5"
                    }}
                >

                    <h2>
                        UAV Analysis Workflow
                    </h2>

                    <p>
                        1. Select mission
                    </p>

                    <p>
                        2. Upload drone video
                    </p>

                    <p>
                        3. Backend extracts video frames
                    </p>

                    <p>
                        4. AI model detects pests
                    </p>

                    <p>
                        5. Detection results are stored
                    </p>

                    <p>
                        6. AgroGuard AI displays results and advisory
                    </p>

                </div>

            </section>

        </>

    );


    // ==========================================================
    // DETECTION RESULTS
    // ==========================================================

    const ResultsPage = () => {

        const resultData =
            selectedResults;

        const results =
            resultData &&
            Array.isArray(
                resultData.results
            )
                ? resultData.results
                : [];

        const totalDetectionsForMission =
            results.reduce(
                (
                    count,
                    frame
                ) =>
                    count +
                    (
                        Array.isArray(
                            frame.detections
                        )
                            ? frame.detections.length
                            : 0
                    ),
                0
            );

        const severity =
            resultData?.severity || null;

        const severityLevel =
            severity?.severity_level || "LOW";

        const severityScore =
            Number(
                severity?.severity_score || 0
            );

        const averageConfidence =
            Number(
                severity?.average_confidence || 0
            );

        const detectedPests =
            Array.isArray(
                severity?.detected_pests
            )
                ? severity.detected_pests
                : [];

        const zonesData =
            resultData?.zone_analysis || null;

        const zones =
            Array.isArray(
                zonesData?.zones
            )
                ? zonesData.zones
                : [];

        const displayZones =
            Array.from(
                { length: 9 },
                (_, index) =>
                    zones[index] || {
                        zone: index + 1,
                        risk_level: "LOW",
                        total_detections: 0,
                        average_confidence: 0
                    }
            );

        const sprayAdvisories =
            Array.isArray(
                resultData?.spray_advisories
            )
                ? resultData.spray_advisories
                : [];

        const uniqueSprayAdvisories =
            Array.from(
                new Map(
                    sprayAdvisories.map(
                        (advisory) => [
                            advisory.pest,
                            advisory
                        ]
                    )
                ).values()
            );

        const getRiskStyle = (
            riskLevel
        ) => {

            const risk =
                String(
                    riskLevel || "LOW"
                ).toUpperCase();

            if (risk === "HIGH") {
                return {
                    background: "#fde8e8",
                    border: "1px solid #ef4444",
                    color: "#dc2626"
                };
            }

            if (risk === "MODERATE") {
                return {
                    background: "#fff7d6",
                    border: "1px solid #eab308",
                    color: "#a16207"
                };
            }

            return {
                background: "#eef8ee",
                border: "1px solid #86c986",
                color: "#16801a"
            };
        };

        return (

            <>

                <header className="topbar">

                    <div>

                        <h1>
                            Detection Results
                        </h1>

                        <p>
                            AI pest detections from UAV mission videos.
                        </p>

                    </div>


                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px"
                        }}
                    >

                        <div className="system-status">

                            <div className="status-dot"></div>

                            AI System Online

                        </div>


                        {selectedMissionId && (

                            <button
                                type="button"
                                onClick={async () => {

                                    try {

                                        const response =
                                            await downloadMissionReport(
                                                selectedMissionId
                                            );

                                        const blob =
                                            new Blob(
                                                [response.data],
                                                {
                                                    type:
                                                        "application/pdf"
                                                }
                                            );

                                        const url =
                                            window.URL.createObjectURL(
                                                blob
                                            );

                                        const link =
                                            document.createElement(
                                                "a"
                                            );

                                        link.href = url;

                                        link.download =
                                            `mission_${selectedMissionId}_report.pdf`;

                                        document.body.appendChild(
                                            link
                                        );

                                        link.click();

                                        document.body.removeChild(
                                            link
                                        );

                                        window.URL.revokeObjectURL(
                                            url
                                        );

                                    } catch (error) {

                                        console.error(
                                            "Mission report download failed:",
                                            error
                                        );

                                        alert(
                                            "Unable to download mission report."
                                        );

                                    }

                                }}
                                style={{
                                    padding:
                                        "10px 16px",
                                    borderRadius:
                                        "8px",
                                    border: "none",
                                    background:
                                        "#2e7d32",
                                    color: "white",
                                    fontWeight:
                                        "600",
                                    cursor:
                                        "pointer"
                                }}
                            >
                                Download Mission Report
                            </button>

                        )}

                    </div>

                </header>


                <section
                    className="section"
                    style={{
                        marginTop: "20px"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            marginBottom: "20px"
                        }}
                    >

                        <div>

                            <h2>
                                Select Mission
                            </h2>

                            <p>
                                View YOLO detection results for a mission.
                            </p>

                        </div>


                        <select
                            value={
                                selectedMissionId || ""
                            }
                            onChange={(event) =>
                                setSelectedMissionId(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                            style={{
                                padding: "10px",
                                borderRadius: "8px",
                                border:
                                    "1px solid #ccc"
                            }}
                        >

                            {missions.map(
                                (mission) => (

                                    <option
                                        key={mission.id}
                                        value={mission.id}
                                    >

                                        {
                                            mission.mission_name
                                        }

                                        {" "}
                                        (ID:{" "}
                                        {
                                            mission.id
                                        })

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {selectedMission ? (

                        <>

                            <div
                                style={{
                                    marginBottom:
                                        "20px"
                                }}
                            >

                                <h2>
                                    {
                                        selectedMission.mission_name
                                    }
                                </h2>

                                <p>
                                    Mission ID:{" "}
                                    {
                                        selectedMission.id
                                    }

                                    {" • "}

                                    Status:{" "}
                                    {
                                        selectedMission.status
                                    }
                                </p>

                            </div>


                            {/* ==================================================
                                AI FIELD RISK ASSESSMENT
                            ================================================== */}

                            {severity && (

                                <section
                                    className="section"
                                    style={{
                                        padding: 0,
                                        marginBottom:
                                            "20px"
                                    }}
                                >

                                    <div
                                        style={{
                                            padding:
                                                "25px",
                                            borderRadius:
                                                "12px",
                                            background:
                                                "#ffffff",
                                            border:
                                                "1px solid #dcebd5",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.05)"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                flexWrap:
                                                    "wrap",
                                                gap:
                                                    "15px"
                                            }}
                                        >

                                            <div>

                                                <small
                                                    style={{
                                                        fontWeight:
                                                            700,
                                                        letterSpacing:
                                                            "0.08em"
                                                    }}
                                                >
                                                    AI FIELD RISK ASSESSMENT
                                                </small>

                                                <h2
                                                    style={{
                                                        margin:
                                                            "8px 0 4px"
                                                    }}
                                                >
                                                    {
                                                        severityLevel
                                                    }
                                                </h2>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color:
                                                            "#666"
                                                    }}
                                                >
                                                    Detection-based pest risk assessment
                                                </p>

                                            </div>


                                            <div
                                                style={{
                                                    padding:
                                                        "15px 22px",
                                                    borderRadius:
                                                        "10px",
                                                    background:
                                                        "#f8faf8",
                                                    textAlign:
                                                        "center"
                                                }}
                                            >

                                                <small>
                                                    RISK SCORE
                                                </small>

                                                <strong
                                                    style={{
                                                        display:
                                                            "block",
                                                        fontSize:
                                                            "28px"
                                                    }}
                                                >
                                                    {
                                                        severityScore.toFixed(
                                                            1
                                                        )
                                                    }
                                                </strong>

                                                <small>
                                                    / 100
                                                </small>

                                            </div>

                                        </div>


                                        <div
                                            style={{
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "repeat(3, 1fr)",
                                                gap:
                                                    "12px",
                                                marginTop:
                                                    "20px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    padding:
                                                        "15px",
                                                    background:
                                                        "#f8faf8",
                                                    borderRadius:
                                                        "10px",
                                                    textAlign:
                                                        "center"
                                                }}
                                            >

                                                <small>
                                                    Total Detections
                                                </small>

                                                <strong
                                                    style={{
                                                        display:
                                                            "block",
                                                        fontSize:
                                                            "22px",
                                                        marginTop:
                                                            "5px"
                                                    }}
                                                >
                                                    {
                                                        totalDetectionsForMission
                                                    }
                                                </strong>

                                            </div>


                                            <div
                                                style={{
                                                    padding:
                                                        "15px",
                                                    background:
                                                        "#f8faf8",
                                                    borderRadius:
                                                        "10px",
                                                    textAlign:
                                                        "center"
                                                }}
                                            >

                                                <small>
                                                    Average Confidence
                                                </small>

                                                <strong
                                                    style={{
                                                        display:
                                                            "block",
                                                        fontSize:
                                                            "22px",
                                                        marginTop:
                                                            "5px"
                                                    }}
                                                >
                                                    {
                                                        (
                                                            averageConfidence *
                                                            100
                                                        ).toFixed(
                                                            1
                                                        )
                                                    }%
                                                </strong>

                                            </div>


                                            <div
                                                style={{
                                                    padding:
                                                        "15px",
                                                    background:
                                                        "#f8faf8",
                                                    borderRadius:
                                                        "10px",
                                                    textAlign:
                                                        "center"
                                                }}
                                            >

                                                <small>
                                                    Pest Types
                                                </small>

                                                <strong
                                                    style={{
                                                        display:
                                                            "block",
                                                        fontSize:
                                                            "22px",
                                                        marginTop:
                                                            "5px"
                                                    }}
                                                >
                                                    {
                                                        detectedPests.length
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        {detectedPests.length >
                                            0 && (

                                            <div
                                                style={{
                                                    marginTop:
                                                        "20px"
                                                }}
                                            >

                                                <strong>
                                                    Detected Pests
                                                </strong>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        flexWrap:
                                                            "wrap",
                                                        gap:
                                                            "8px",
                                                        marginTop:
                                                            "10px"
                                                    }}
                                                >

                                                    {detectedPests.map(
                                                        (pest) => (

                                                            <span
                                                                key={
                                                                    pest
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "6px 12px",
                                                                    borderRadius:
                                                                        "20px",
                                                                    background:
                                                                        "#eef5e9",
                                                                    fontSize:
                                                                        "13px",
                                                                    fontWeight:
                                                                        600
                                                                }}
                                                            >
                                                                {
                                                                    pest
                                                                }
                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        )}


                                        {severity.note && (

                                            <p
                                                style={{
                                                    marginTop:
                                                        "20px",
                                                    marginBottom:
                                                        0,
                                                    fontSize:
                                                        "12px",
                                                    color:
                                                        "#6b7280"
                                                }}
                                            >
                                                {
                                                    severity.note
                                                }
                                            </p>

                                        )}

                                    </div>

                                </section>

                            )}


                            {/* ==================================================
                                SPATIAL PEST RISK — 3 x 3 MAP
                            ================================================== */}

                            <section
                                className="section"
                                style={{
                                    padding: 0,
                                    marginBottom:
                                        "20px"
                                }}
                            >

                                <div
                                    style={{
                                        padding:
                                            "25px",
                                        borderRadius:
                                            "12px",
                                        background:
                                            "#ffffff",
                                        border:
                                            "1px solid #dcebd5",
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.05)"
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center",
                                            flexWrap:
                                                "wrap",
                                            gap:
                                                "15px",
                                            marginBottom:
                                                "20px"
                                        }}
                                    >

                                        <div>

                                            <small
                                                style={{
                                                    fontWeight:
                                                        700,
                                                    letterSpacing:
                                                        "0.08em"
                                                }}
                                            >
                                                SPATIAL PEST RISK
                                            </small>

                                            <h2
                                                style={{
                                                    margin:
                                                        "8px 0"
                                                }}
                                            >
                                                Risk Zone Map
                                            </h2>

                                            <p
                                                style={{
                                                    margin:
                                                        0,
                                                    color:
                                                        "#666"
                                                }}
                                            >
                                                Image-based 3 × 3 demonstration risk zoning
                                            </p>

                                        </div>


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap:
                                                    "12px",
                                                flexWrap:
                                                    "wrap",
                                                fontSize:
                                                    "13px"
                                            }}
                                        >

                                            <span>
                                                🟢 Low Risk
                                            </span>

                                            <span>
                                                🟡 Moderate Risk
                                            </span>

                                            <span>
                                                🔴 High Risk
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        style={{
                                            width:
                                                "100%",
                                            maxWidth:
                                                "520px",
                                            margin:
                                                "0 auto",
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                                "repeat(3, 1fr)",
                                            gap:
                                                "4px"
                                        }}
                                    >

                                        {displayZones.map(
                                            (
                                                zone,
                                                index
                                            ) => {

                                                const riskLevel =
                                                    String(
                                                        zone?.risk_level ||
                                                        "LOW"
                                                    ).toUpperCase();

                                                const riskStyle =
                                                    getRiskStyle(
                                                        riskLevel
                                                    );

                                                const zoneNumber =
                                                    zone?.zone ||
                                                    index + 1;

                                                const detectionCount =
                                                    Number(
                                                        zone?.total_detections ||
                                                        0
                                                    );

                                                return (

                                                    <div
                                                        key={
                                                            zoneNumber
                                                        }
                                                        style={{
                                                            minHeight:
                                                                "105px",
                                                            padding:
                                                                "14px 8px",
                                                            display:
                                                                "flex",
                                                            flexDirection:
                                                                "column",
                                                            justifyContent:
                                                                "center",
                                                            alignItems:
                                                                "center",
                                                            textAlign:
                                                                "center",
                                                            background:
                                                                riskStyle.background,
                                                            border:
                                                                riskStyle.border
                                                        }}
                                                    >

                                                        <strong
                                                            style={{
                                                                color:
                                                                    riskStyle.color,
                                                                fontSize:
                                                                    "15px"
                                                            }}
                                                        >
                                                            {
                                                                riskLevel
                                                            }
                                                        </strong>

                                                        <strong
                                                            style={{
                                                                marginTop:
                                                                    "6px",
                                                                fontSize:
                                                                    "14px"
                                                            }}
                                                        >
                                                            Zone{" "}
                                                            {
                                                                zoneNumber
                                                            }
                                                        </strong>

                                                        <small
                                                            style={{
                                                                marginTop:
                                                                    "6px",
                                                                color:
                                                                    "#555"
                                                            }}
                                                        >
                                                            {
                                                                detectionCount
                                                            }{" "}
                                                            detection
                                                            {
                                                                detectionCount ===
                                                                1
                                                                    ? ""
                                                                    : "s"
                                                            }
                                                        </small>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "center",
                                            gap:
                                                "25px",
                                            flexWrap:
                                                "wrap",
                                            marginTop:
                                                "18px",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                600
                                        }}
                                    >

                                        <span>
                                            High:{" "}
                                            {
                                                zonesData?.summary
                                                    ?.high_risk_zone_count ||
                                                0
                                            }
                                        </span>

                                        <span>
                                            Moderate:{" "}
                                            {
                                                zonesData?.summary
                                                    ?.moderate_risk_zone_count ||
                                                0
                                            }
                                        </span>

                                        <span>
                                            Low:{" "}
                                            {
                                                zonesData?.summary
                                                    ?.low_risk_zone_count ??
                                                displayZones.filter(
                                                    (zone) =>
                                                        String(
                                                            zone?.risk_level ||
                                                            "LOW"
                                                        ).toUpperCase() ===
                                                        "LOW"
                                                ).length
                                            }
                                        </span>

                                    </div>


                                    <p
                                        style={{
                                            marginTop:
                                                "20px",
                                            marginBottom:
                                                0,
                                            fontSize:
                                                "12px",
                                            color:
                                                "#6b7280",
                                            textAlign:
                                                "center"
                                        }}
                                    >
                                        {
                                            zonesData?.note ||
                                            "This is an image-based demonstration of pest risk zoning. Actual geographic affected field area requires calibrated UAV, GPS and geospatial data."
                                        }
                                    </p>

                                </div>

                            </section>


                            {/* ==================================================
                                DETECTION TABLE
                            ================================================== */}

                            <section className="section">

                                <div
                                    className="mission-table"
                                >

                                    <div
                                        className="table-header"
                                    >

                                        <div>
                                            PEST
                                        </div>

                                        <div>
                                            CONFIDENCE
                                        </div>

                                        <div>
                                            FRAME
                                        </div>

                                        <div>
                                            BOUNDING BOX
                                        </div>

                                    </div>


                                    {results.length === 0 ? (

                                        <div
                                            className="mission-row"
                                        >

                                            <div>
                                                No detection results found.
                                            </div>

                                        </div>

                                    ) : (

                                        results.map(
                                            (
                                                frame,
                                                frameIndex
                                            ) => {

                                                if (
                                                    !Array.isArray(
                                                        frame.detections
                                                    )
                                                ) {
                                                    return null;
                                                }

                                                return frame.detections.map(
                                                    (
                                                        detection,
                                                        detectionIndex
                                                    ) => {

                                                        const bbox =
                                                            detection?.bbox ||
                                                            detection?.bounding_box ||
                                                            null;

                                                        const x1 =
                                                            bbox
                                                                ? Number(
                                                                    bbox.x1 ??
                                                                    bbox[0] ??
                                                                    0
                                                                )
                                                                : null;

                                                        const y1 =
                                                            bbox
                                                                ? Number(
                                                                    bbox.y1 ??
                                                                    bbox[1] ??
                                                                    0
                                                                )
                                                                : null;

                                                        const x2 =
                                                            bbox
                                                                ? Number(
                                                                    bbox.x2 ??
                                                                    bbox[2] ??
                                                                    0
                                                                )
                                                                : null;

                                                        const y2 =
                                                            bbox
                                                                ? Number(
                                                                    bbox.y2 ??
                                                                    bbox[3] ??
                                                                    0
                                                                )
                                                                : null;

                                                        return (

                                                            <div
                                                                className="mission-row"
                                                                key={`${frameIndex}-${detectionIndex}`}
                                                            >

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            detection.class_name
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        Class ID:{" "}
                                                                        {
                                                                            detection.class_id
                                                                        }
                                                                    </small>

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            (
                                                                                Number(
                                                                                    detection.confidence ||
                                                                                    0
                                                                                ) *
                                                                                100
                                                                            ).toFixed(
                                                                                1
                                                                            )
                                                                        }%
                                                                    </strong>

                                                                </div>


                                                                <div>
                                                                    {
                                                                        frame.frame
                                                                    }
                                                                </div>


                                                                <div>

                                                                    {bbox ? (

                                                                        <small>

                                                                            x1:{" "}
                                                                            {
                                                                                x1.toFixed(
                                                                                    2
                                                                                )
                                                                            }

                                                                            {" | "}

                                                                            y1:{" "}
                                                                            {
                                                                                y1.toFixed(
                                                                                    2
                                                                                )
                                                                            }

                                                                            {" | "}

                                                                            x2:{" "}
                                                                            {
                                                                                x2.toFixed(
                                                                                    2
                                                                                )
                                                                            }

                                                                            {" | "}

                                                                            y2:{" "}
                                                                            {
                                                                                y2.toFixed(
                                                                                    2
                                                                                )
                                                                            }

                                                                        </small>

                                                                    ) : (

                                                                        "Not available"

                                                                    )}

                                                                </div>

                                                            </div>

                                                        );

                                                    }
                                                );

                                            }
                                        )

                                    )}

                                </div>

                            </section>


                            {/* ==================================================
                                SPRAY ADVISORY — AFTER DETECTION TABLE
                            ================================================== */}

                                                    <section className="section">

                                <div
                                    style={{
                                        padding: "28px",
                                        borderRadius: "16px",
                                        background:
                                            "linear-gradient(135deg, #f4faef 0%, #ffffff 100%)",
                                        border: "1px solid #d8e8d2",
                                        boxShadow:
                                            "0 6px 18px rgba(46, 125, 50, 0.08)"
                                    }}
                                >

                                    {/* ==================================================
                                        ADVISORY HEADER
                                    ================================================== */}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: "20px",
                                            flexWrap: "wrap",
                                            marginBottom: "24px"
                                        }}
                                    >

                                        <div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    marginBottom: "6px"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        fontSize: "24px"
                                                    }}
                                                >
                                                    🌱
                                                </span>

                                                <h2
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "22px"
                                                    }}
                                                >
                                                    Spray Advisory
                                                </h2>

                                            </div>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: "#5f6b61",
                                                    fontSize: "14px",
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                Agricultural pest-management
                                                decision support based on the
                                                AgroGuard AI advisory dataset.
                                            </p>

                                        </div>


                                        <div
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: "20px",
                                                background: "#eaf5e6",
                                                color: "#2e7d32",
                                                fontSize: "12px",
                                                fontWeight: 700,
                                                border:
                                                    "1px solid #cfe4c9"
                                            }}
                                        >
                                            AI DECISION SUPPORT
                                        </div>

                                    </div>


                                    {/* ==================================================
                                        ADVISORY CARDS
                                    ================================================== */}

                                    {uniqueSprayAdvisories.length > 0 ? (

                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(auto-fit, minmax(320px, 1fr))",
                                                gap: "20px"
                                            }}
                                        >

                                            {uniqueSprayAdvisories.map(
                                                (
                                                    advisory,
                                                    index
                                                ) => {

                                                    const severityValue =
                                                        String(
                                                            advisory?.severity ||
                                                            severityLevel ||
                                                            "LOW"
                                                        ).toUpperCase();

                                                    const severityStyle =
                                                        severityValue ===
                                                        "HIGH"
                                                            ? {
                                                                background:
                                                                    "#fff0f0",
                                                                border:
                                                                    "#ef4444",
                                                                text:
                                                                    "#b91c1c"
                                                            }
                                                            : severityValue ===
                                                              "MODERATE"
                                                            ? {
                                                                background:
                                                                    "#fff8df",
                                                                border:
                                                                    "#eab308",
                                                                text:
                                                                    "#a16207"
                                                            }
                                                            : {
                                                                background:
                                                                    "#eef8ee",
                                                                border:
                                                                    "#86c986",
                                                                text:
                                                                    "#16801a"
                                                            };

                                                    const confidence =
                                                        Number(
                                                            advisory?.confidence ||
                                                            0
                                                        );

                                                    const detectionCount =
                                                        Number(
                                                            advisory?.detection_count ||
                                                            0
                                                        );

                                                    const hasVerifiedRecord =
                                                        advisory?.advisory_status ===
                                                        "Verified advisory record found";

                                                    return (

                                                        <div
                                                            key={`${advisory.pest}-${index}`}
                                                            style={{
                                                                background:
                                                                    "#ffffff",
                                                                border:
                                                                    "1px solid #dce6d9",
                                                                borderRadius:
                                                                    "14px",
                                                                overflow:
                                                                    "hidden",
                                                                boxShadow:
                                                                    "0 4px 14px rgba(0,0,0,0.05)"
                                                            }}
                                                        >

                                                            {/* PEST HEADER */}

                                                            <div
                                                                style={{
                                                                    padding:
                                                                        "20px 22px",
                                                                    borderBottom:
                                                                        "1px solid #edf1eb",
                                                                    display:
                                                                        "flex",
                                                                    justifyContent:
                                                                        "space-between",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "15px"
                                                                }}
                                                            >

                                                                <div>

                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                "12px",
                                                                            fontWeight:
                                                                                700,
                                                                            color:
                                                                                "#748074",
                                                                            textTransform:
                                                                                "uppercase",
                                                                            letterSpacing:
                                                                                "0.08em",
                                                                            marginBottom:
                                                                                "5px"
                                                                        }}
                                                                    >
                                                                        Detected Pest
                                                                    </div>

                                                                    <h3
                                                                        style={{
                                                                            margin: 0,
                                                                            fontSize:
                                                                                "21px",
                                                                            color:
                                                                                "#1f2937"
                                                                        }}
                                                                    >
                                                                        {
                                                                            advisory.pest ||
                                                                            "Unknown Pest"
                                                                        }
                                                                    </h3>

                                                                </div>


                                                                <div
                                                                    style={{
                                                                        padding:
                                                                            "6px 12px",
                                                                        borderRadius:
                                                                            "20px",
                                                                        background:
                                                                            severityStyle.background,
                                                                        color:
                                                                            severityStyle.text,
                                                                        border:
                                                                            `1px solid ${severityStyle.border}`,
                                                                        fontSize:
                                                                            "12px",
                                                                        fontWeight:
                                                                            800
                                                                    }}
                                                                >
                                                                    {severityValue}
                                                                </div>

                                                            </div>


                                                            {/* QUICK METRICS */}

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "grid",
                                                                    gridTemplateColumns:
                                                                        "repeat(3, 1fr)",
                                                                    gap:
                                                                        "1px",
                                                                    background:
                                                                        "#e9eee7"
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        background:
                                                                            "#ffffff",
                                                                        padding:
                                                                            "15px",
                                                                        textAlign:
                                                                            "center"
                                                                    }}
                                                                >

                                                                    <small
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                            color:
                                                                                "#7b857b",
                                                                            fontSize:
                                                                                "11px",
                                                                            fontWeight:
                                                                                600
                                                                        }}
                                                                    >
                                                                        DETECTIONS
                                                                    </small>

                                                                    <strong
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                            marginTop:
                                                                                "5px",
                                                                            fontSize:
                                                                                "19px",
                                                                            color:
                                                                                "#263238"
                                                                        }}
                                                                    >
                                                                        {
                                                                            detectionCount ||
                                                                            totalDetectionsForMission
                                                                        }
                                                                    </strong>

                                                                </div>


                                                                <div
                                                                    style={{
                                                                        background:
                                                                            "#ffffff",
                                                                        padding:
                                                                            "15px",
                                                                        textAlign:
                                                                            "center"
                                                                    }}
                                                                >

                                                                    <small
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                            color:
                                                                                "#7b857b",
                                                                            fontSize:
                                                                                "11px",
                                                                            fontWeight:
                                                                                600
                                                                        }}
                                                                    >
                                                                        CONFIDENCE
                                                                    </small>

                                                                    <strong
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                            marginTop:
                                                                                "5px",
                                                                            fontSize:
                                                                                "19px",
                                                                            color:
                                                                                "#263238"
                                                                        }}
                                                                    >
                                                                        {
                                                                            (
                                                                                confidence *
                                                                                100
                                                                            ).toFixed(
                                                                                1
                                                                            )
                                                                        }%
                                                                    </strong>

                                                                </div>


                                                                <div
                                                                    style={{
                                                                        background:
                                                                            "#ffffff",
                                                                        padding:
                                                                            "15px",
                                                                        textAlign:
                                                                            "center"
                                                                    }}
                                                                >

                                                                    <small
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                            color:
                                                                                "#7b857b",
                                                                            fontSize:
                                                                                "11px",
                                                                            fontWeight:
                                                                                600
                                                                        }}
                                                                    >
                                                                        CROP
                                                                    </small>

                                                                    <strong
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                            marginTop:
                                                                                "5px",
                                                                            fontSize:
                                                                                "13px",
                                                                            color:
                                                                                "#263238"
                                                                        }}
                                                                    >
                                                                        {
                                                                            advisory.crop ||
                                                                            "Crop-dependent"
                                                                        }
                                                                    </strong>

                                                                </div>

                                                            </div>


                                                            {/* ADVISORY STATUS */}

                                                            <div
                                                                style={{
                                                                    margin:
                                                                        "18px 20px 0",
                                                                    padding:
                                                                        "13px 15px",
                                                                    borderRadius:
                                                                        "10px",
                                                                    background:
                                                                        hasVerifiedRecord
                                                                            ? "#eef8ee"
                                                                            : "#fff8e6",
                                                                    border:
                                                                        hasVerifiedRecord
                                                                            ? "1px solid #cde4c8"
                                                                            : "1px solid #f0d58a"
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "11px",
                                                                        fontWeight:
                                                                            800,
                                                                        letterSpacing:
                                                                            "0.05em",
                                                                        color:
                                                                            hasVerifiedRecord
                                                                                ? "#2e7d32"
                                                                                : "#9a6700",
                                                                        marginBottom:
                                                                            "5px"
                                                                    }}
                                                                >
                                                                    ADVISORY STATUS
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "13px",
                                                                        lineHeight:
                                                                            1.5,
                                                                        color:
                                                                            "#4b5563"
                                                                    }}
                                                                >
                                                                    {
                                                                        advisory.advisory_status ||
                                                                        "Advisory status unavailable"
                                                                    }
                                                                </div>

                                                            </div>


                                                            {/* RECOMMENDATION */}

                                                            <div
                                                                style={{
                                                                    padding:
                                                                        "20px"
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "grid",
                                                                        gridTemplateColumns:
                                                                            "repeat(auto-fit, minmax(220px, 1fr))",
                                                                        gap:
                                                                            "14px"
                                                                    }}
                                                                >

                                                                    {/* MONITORING */}

                                                                    <div
                                                                        style={{
                                                                            padding:
                                                                                "16px",
                                                                            borderRadius:
                                                                                "11px",
                                                                            background:
                                                                                "#f8faf8",
                                                                            border:
                                                                                "1px solid #e5ebe3"
                                                                        }}
                                                                    >

                                                                        <div
                                                                            style={{
                                                                                fontWeight:
                                                                                    800,
                                                                                fontSize:
                                                                                    "13px",
                                                                                color:
                                                                                    "#263238",
                                                                                marginBottom:
                                                                                    "7px"
                                                                            }}
                                                                        >
                                                                            🔍 Monitoring
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "13px",
                                                                                lineHeight:
                                                                                    1.6,
                                                                                color:
                                                                                    "#5f6b61"
                                                                            }}
                                                                        >
                                                                            {
                                                                                advisory.monitoring ||
                                                                                "Continue monitoring affected plants and nearby plants."
                                                                            }
                                                                        </div>

                                                                    </div>


                                                                    {/* ACTION */}

                                                                    <div
                                                                        style={{
                                                                            padding:
                                                                                "16px",
                                                                            borderRadius:
                                                                                "11px",
                                                                            background:
                                                                                "#f8faf8",
                                                                            border:
                                                                                "1px solid #e5ebe3"
                                                                        }}
                                                                    >

                                                                        <div
                                                                            style={{
                                                                                fontWeight:
                                                                                    800,
                                                                                fontSize:
                                                                                    "13px",
                                                                                color:
                                                                                    "#263238",
                                                                                marginBottom:
                                                                                    "7px"
                                                                            }}
                                                                        >
                                                                            ✓ Recommended Action
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "13px",
                                                                                lineHeight:
                                                                                    1.6,
                                                                                color:
                                                                                    "#5f6b61"
                                                                            }}
                                                                        >
                                                                            {
                                                                                advisory.action ||
                                                                                "Follow validated integrated pest-management practices."
                                                                            }
                                                                        </div>

                                                                    </div>


                                                                    {/* INTERVENTION */}

                                                                    <div
                                                                        style={{
                                                                            padding:
                                                                                "16px",
                                                                            borderRadius:
                                                                                "11px",
                                                                            background:
                                                                                "#fffaf0",
                                                                            border:
                                                                                "1px solid #f0dfb5"
                                                                        }}
                                                                    >

                                                                        <div
                                                                            style={{
                                                                                fontWeight:
                                                                                    800,
                                                                                fontSize:
                                                                                    "13px",
                                                                                color:
                                                                                    "#6b4f00",
                                                                                marginBottom:
                                                                                    "7px"
                                                                            }}
                                                                        >
                                                                            ⚠ Intervention Guidance
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "13px",
                                                                                lineHeight:
                                                                                    1.6,
                                                                                color:
                                                                                    "#6b6250"
                                                                            }}
                                                                        >
                                                                            {
                                                                                advisory.intervention ||
                                                                                "Consult qualified agricultural guidance before selecting any pesticide."
                                                                            }
                                                                        </div>

                                                                    </div>

                                                                </div>


                                                                {/* VERIFIED CHEMICAL DATA */}

                                                                {hasVerifiedRecord && (

                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                "16px",
                                                                            padding:
                                                                                "16px",
                                                                            borderRadius:
                                                                                "11px",
                                                                            background:
                                                                                "#f5f9f3",
                                                                            border:
                                                                                "1px solid #dce8d8"
                                                                        }}
                                                                    >

                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "12px",
                                                                                fontWeight:
                                                                                    800,
                                                                                color:
                                                                                    "#2e7d32",
                                                                                marginBottom:
                                                                                    "12px"
                                                                            }}
                                                                        >
                                                                            VERIFIED AGRICULTURAL RECOMMENDATION
                                                                        </div>


                                                                        <div
                                                                            style={{
                                                                                display:
                                                                                    "grid",
                                                                                gridTemplateColumns:
                                                                                    "repeat(auto-fit, minmax(170px, 1fr))",
                                                                                gap:
                                                                                    "12px"
                                                                            }}
                                                                        >

                                                                            <div>
                                                                                <small>
                                                                                    Recommendation
                                                                                </small>

                                                                                <strong
                                                                                    style={{
                                                                                        display:
                                                                                            "block",
                                                                                        marginTop:
                                                                                            "4px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        advisory.recommendation_class ||
                                                                                        "Not specified"
                                                                                    }
                                                                                </strong>
                                                                            </div>


                                                                            <div>
                                                                                <small>
                                                                                    Active Ingredient
                                                                                </small>

                                                                                <strong
                                                                                    style={{
                                                                                        display:
                                                                                            "block",
                                                                                        marginTop:
                                                                                            "4px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        advisory.active_ingredient ||
                                                                                        "Not specified"
                                                                                    }
                                                                                </strong>
                                                                            </div>


                                                                            <div>
                                                                                <small>
                                                                                    Formulation
                                                                                </small>

                                                                                <strong
                                                                                    style={{
                                                                                        display:
                                                                                            "block",
                                                                                        marginTop:
                                                                                            "4px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        advisory.formulation ||
                                                                                        "Not specified"
                                                                                    }
                                                                                </strong>
                                                                            </div>


                                                                            <div>
                                                                                <small>
                                                                                    Dose
                                                                                </small>

                                                                                <strong
                                                                                    style={{
                                                                                        display:
                                                                                            "block",
                                                                                        marginTop:
                                                                                            "4px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        advisory.dose ||
                                                                                        "Not specified"
                                                                                    }
                                                                                </strong>
                                                                            </div>


                                                                            <div>
                                                                                <small>
                                                                                    Application Method
                                                                                </small>

                                                                                <strong
                                                                                    style={{
                                                                                        display:
                                                                                            "block",
                                                                                        marginTop:
                                                                                            "4px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        advisory.application_method ||
                                                                                        "Not specified"
                                                                                    }
                                                                                </strong>
                                                                            </div>


                                                                            <div>
                                                                                <small>
                                                                                    Economic Threshold
                                                                                </small>

                                                                                <strong
                                                                                    style={{
                                                                                        display:
                                                                                            "block",
                                                                                        marginTop:
                                                                                            "4px"
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        advisory.economic_threshold ||
                                                                                        "Not specified"
                                                                                    }
                                                                                </strong>
                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                )}

                                                            </div>

                                                        </div>

                                                    );
                                                }
                                            )}

                                        </div>

                                    ) : (

                                        <div
                                            style={{
                                                padding: "30px",
                                                textAlign: "center",
                                                background: "#ffffff",
                                                borderRadius: "12px",
                                                border:
                                                    "1px dashed #cbd8c8"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontSize: "30px",
                                                    marginBottom: "10px"
                                                }}
                                            >
                                                🌿
                                            </div>

                                            <h3
                                                style={{
                                                    margin: "0 0 8px"
                                                }}
                                            >
                                                No Spray Advisory Available
                                            </h3>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: "#68736a",
                                                    fontSize: "14px"
                                                }}
                                            >
                                                No pest-specific advisory was
                                                generated for this mission.
                                            </p>

                                        </div>

                                    )}


                                    {/* SAFETY FOOTER */}

                                    <div
                                        style={{
                                            marginTop: "20px",
                                            paddingTop: "16px",
                                            borderTop:
                                                "1px solid #dce7d9",
                                            fontSize: "12px",
                                            lineHeight: 1.6,
                                            color: "#69756b"
                                        }}
                                    >

                                        <strong
                                            style={{
                                                color: "#4f5b51"
                                            }}
                                        >
                                            AgroGuard AI safety note:
                                        </strong>

                                        {" "}

                                        The system provides agricultural
                                        decision-support information. Chemical
                                        application should only follow validated
                                        crop-specific recommendations, local
                                        agricultural guidance, and product-label
                                        instructions.

                                    </div>

                                </div>

                            </section>

                        </>

                    ) : (

                        <div
                            style={{
                                padding:
                                    "30px",
                                textAlign:
                                    "center"
                            }}
                        >

                            <h3>
                                No mission selected
                            </h3>

                            <p>
                                Create or upload a mission first.
                            </p>

                        </div>

                    )}

                </section>

            </>

        );

    };


    // ==========================================================
    // SIMPLE PAGES
    // ==========================================================

    const SimplePage = ({
        title,
        description
    }) => (

        <>

            <header className="topbar">

                <div>

                    <h1>
                        {title}
                    </h1>

                    <p>
                        {description}
                    </p>

                </div>


                <div className="system-status">

                    <div className="status-dot"></div>

                    System Online

                </div>

            </header>


            <section className="section">

                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0"
                    }}
                >

                    <h2>
                        {title}
                    </h2>

                    <p>
                        This module is ready for integration.
                    </p>

                </div>

            </section>

        </>

    );


    // ==========================================================
    // PAGE SELECTOR
    // ==========================================================

    const renderPage = () => {

        switch (activePage) {

            case "dashboard":
                return <DashboardPage />;

            case "missions":
                return <MissionsPage />;

            case "video":
                return <VideoPage />;

            case "results":
                return <ResultsPage />;

            case "farms":

                return (
                    <SimplePage
                        title="Farms"
                        description="Manage registered agricultural farms."
                    />
                );

            case "farmers":

                return (
                    <SimplePage
                        title="Farmers"
                        description="Manage farmers associated with AgroGuard AI."
                    />
                );

            default:
                return <DashboardPage />;

        }

    };


    // ==========================================================
    // FINAL UI
    // ==========================================================

    return (

        <div className="app">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="logo">

                    <div className="logo-icon">🌿</div>

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

                    <button
                        className={
                            `nav-item ${
                                activePage === "dashboard"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            handleNavigation(
                                "dashboard"
                            )
                        }
                    >

                        <span>⌂</span>

                        Dashboard

                    </button>


                    <button
                        className={
                            `nav-item ${
                                activePage === "farms"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            handleNavigation(
                                "farms"
                            )
                        }
                    >

                        <span>🚜</span>

                        Farms

                    </button>


                    <button
                        className={
                            `nav-item ${
                                activePage === "farmers"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            handleNavigation(
                                "farmers"
                            )
                        }
                    >

                        <span>👨‍🌾</span>

                        Farmers

                    </button>


                    <button
                        className={
                            `nav-item ${
                                activePage === "missions"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            handleNavigation(
                                "missions"
                            )
                        }
                    >

                        <span>🎯</span>

                        Missions

                    </button>


                    <button
                        className={
                            `nav-item ${
                                activePage === "video"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            handleNavigation(
                                "video"
                            )
                        }
                    >

                        <span>📹</span>

                        Video Analysis

                    </button>


                    <button
                        className={
                            `nav-item ${
                                activePage === "results"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            handleNavigation(
                                "results"
                            )
                        }
                    >

                        <span>📊</span>

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


            {/* MAIN */}

            <main className="main-content">

                {renderPage()}

            </main>

        </div>

    );

}


export default App;

