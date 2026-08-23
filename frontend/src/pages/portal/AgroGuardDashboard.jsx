import { useEffect, useState } from "react";
import "../../App.css";
const heroImage = "/assets/agroguard/crops/farm-cotton.jpg";

import {
    getFarmerMissions,
    createMission,
    uploadVideo,
    getMissionResults,
    getFarmerFarms,
    createFarm,
    downloadMissionReport,
} from "../../api";


function AgroGuardDashboard() {

    // ==========================================================
    // STATE
    // ==========================================================

    const [missions, setMissions] = useState([]);

    const [farms, setFarms] = useState([]);

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

    const [createdMission, setCreatedMission] = useState(null);

    const [selectedFarmId, setSelectedFarmId] = useState("");

    const [farmForm, setFarmForm] = useState({
        farm_name: "",
        crop_type: "",
        farm_type: "",
        season: "",
        area: "",
        latitude: "",
        longitude: ""
    });

    const [creatingFarm, setCreatingFarm] = useState(false);

    const [downloadingReport, setDownloadingReport] = useState(false);


    // ==========================================================
    // LOAD MISSIONS
    // ==========================================================

    const loadMissions = async () => {

        try {

            setLoading(true);

            setError("");

            const farmer = JSON.parse(
                localStorage.getItem("agroguard_farmer")
            );

            if (!farmer?.farmer_id) {
                setError("Please sign in to view your farms and missions.");
                setMissions([]);
                setFarms([]);
                return;
            }

            const farmResponse = await getFarmerFarms(farmer.farmer_id);
            const farmData = Array.isArray(farmResponse.data)
                ? farmResponse.data
                : [];
            setFarms(farmData);

            if (farmData.length > 0 && !selectedFarmId) {
                setSelectedFarmId(String(farmData[0].id));
            }

            const response = await getFarmerMissions(farmer.farmer_id);

            const missionData = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.value)
                    ? response.data.value
                    : [];
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


    const totalFarms = farms.length;


    const totalFarmers =
        JSON.parse(localStorage.getItem("agroguard_farmer"))?.name ? 1 : 0;

    const farmerName =
        JSON.parse(localStorage.getItem("agroguard_farmer"))?.name || "Farmer";

    const currentFarm = farms.find(
        (farm) => String(farm.id) === String(selectedFarmId)
    ) || farms[0];

    const latestMission = missions[0];

    const riskLevelFor = (result) => String(
        result?.severity?.severity_level || ""
    ).toUpperCase();

    const highRiskCount = Object.values(missionResults).filter(
        (result) => riskLevelFor(result) === "HIGH"
    ).length;

    const moderateRiskCount = Object.values(missionResults).filter(
        (result) => ["MODERATE", "MEDIUM"].includes(riskLevelFor(result))
    ).length;

    const lowRiskCount = Object.values(missionResults).filter(
        (result) => riskLevelFor(result) === "LOW"
    ).length;

    const hour = new Date().getHours();
    const timeOfDay = hour < 12
        ? "Good morning"
        : hour < 17
            ? "Good afternoon"
            : "Good evening";


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

        const trimmedMissionName = missionName.trim();
        if (trimmedMissionName.length < 3 || trimmedMissionName.length > 100) {
            setError("Inspection name must be between 3 and 100 characters.");
            return;
        }

        if (!selectedFarmId) {
            setError("Please add and select a farm first.");
            setActivePage("farms");
            return;
        }

        const farmer = JSON.parse(
            localStorage.getItem("agroguard_farmer")
        );

        try {

            setCreatingMission(true);

            setError("");

            const response =
                await createMission({

                    mission_name:
                        trimmedMissionName,

                    farm_id: Number(selectedFarmId),

                    farmer_id: farmer.farmer_id,

                });


            const newMissionId =
                response.data.id;


            setMissionName("");

            setCreatedMission({
                id: newMissionId,
                name: trimmedMissionName,
                farm: farms.find((farm) => farm.id === Number(selectedFarmId))
            });

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


    const handleFarmFormChange = (event) => {
        const { name, value } = event.target;
        setFarmForm((current) => ({ ...current, [name]: value }));
    };


    const handleCreateFarm = async (event) => {
        event.preventDefault();

        const farmer = JSON.parse(
            localStorage.getItem("agroguard_farmer")
        );

        if (!farmer?.farmer_id) {
            setError("Please sign in before adding a farm.");
            return;
        }

        try {
            setCreatingFarm(true);
            setError("");
            const response = await createFarm({
                ...farmForm,
                area: Number(farmForm.area),
                latitude: Number(farmForm.latitude),
                longitude: Number(farmForm.longitude),
                farmer_id: farmer.farmer_id
            });
            setFarmForm({
                farm_name: "",
                crop_type: "",
                farm_type: "",
                season: "",
                area: "",
                latitude: "",
                longitude: ""
            });
            setUploadMessage("Farm added successfully.");
            await loadMissions();
            setSelectedFarmId(String(response.data.id));
        } catch (createError) {
            setError(
                createError.response?.data?.detail ||
                "Failed to add farm."
            );
        } finally {
            setCreatingFarm(false);
        }
    };


    const handleDownloadReport = async (missionId) => {
        try {
            setDownloadingReport(true);
            const farmer = JSON.parse(
                localStorage.getItem("agroguard_farmer")
            );
            const response = await downloadMissionReport(
                missionId,
                farmer?.farmer_id
            );
            const blobUrl = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `AgroGuard_Mission_${missionId}_Report.pdf`;
            document.body.appendChild(link);
            link.click();
            window.setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(blobUrl);
            }, 1500);
        } catch (reportError) {
            setError(
                reportError.response?.data?.detail ||
                "Mission report is not available yet."
            );
        } finally {
            setDownloadingReport(false);
        }
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

                        <div>

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
                        {timeOfDay}, {farmerName}
                    </h1>

                    <p>
                        Your farm at a glance. Make the next decision with confidence.
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


            <section
                className="welcome-card farmer-hero"
                style={{ "--hero-image": `url(${heroImage})` }}
            >

                <div>

                    <div className="eyebrow">
                        UAV AGRICULTURE MONITORING
                    </div>

                    <h2>
                        Monitor. Detect. Act.
                        <br />
                        Protect your crops with AI.
                    </h2>

                    <p>
                        AI-powered UAV surveillance for early pest detection
                        and practical agricultural advisory.
                    </p>


                    <button
                        className="primary-button"
                        onClick={() =>
                            setActivePage("missions")
                        }
                    >
                        + Start New Inspection
                    </button>

                </div>


                <div>

                </div>

            </section>


            <section className="stats-grid">

                <div className="stat-card">

                    <div>

                    </div>

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

                    <div>

                    </div>

                    <div>

                        <span>
                            High Risk
                        </span>

                        <strong>
                            {highRiskCount}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div>

                    </div>

                    <div>

                        <span>
                            Medium Risk
                        </span>

                        <strong>
                            {moderateRiskCount}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div>

                    </div>

                    <div>

                        <span>
                            Low Risk
                        </span>

                        <strong>
                            {lowRiskCount}
                        </strong>

                    </div>

                </div>

            </section>


            <section className="section quick-summary">

                <div className="section-heading">

                    <div>
                        <h2>Quick summary</h2>
                        <p>The latest picture from your registered agriculture.</p>
                    </div>

                </div>

                <div className="summary-grid">
                    <div className="summary-card">
                        <span>Active crop</span>
                        <strong>{currentFarm?.crop_type || "No farm selected"}</strong>
                        <small>{currentFarm?.farm_name || "Register a farm to begin"}</small>
                    </div>
                    <div className="summary-card">
                        <span>Farm area</span>
                        <strong>{currentFarm?.area ? `${currentFarm.area} acres` : "Not available"}</strong>
                        <small>{currentFarm?.latitude && currentFarm?.longitude ? `${currentFarm.latitude}, ${currentFarm.longitude}` : "Location not added"}</small>
                    </div>
                    <div className="summary-card">
                        <span>Last inspection</span>
                        <strong>{latestMission ? `Inspection #${latestMission.id}` : "None yet"}</strong>
                        <small>{latestMission?.status || "Start your first inspection"}</small>
                    </div>
                    <div className="summary-card">
                        <span>Current crop risk</span>
                        <strong>{selectedResults?.severity?.severity_level || "Not assessed"}</strong>
                        <small>{selectedResults ? "Based on latest AI result" : "Upload UAV footage to assess"}</small>
                    </div>
                </div>

            </section>


            <section className="section workflow-strip">
                {[
                    ["01", "Your farm"],
                    ["02", "UAV inspection"],
                    ["03", "AI detection"],
                    ["04", "Risk & advisory"],
                    ["05", "Report"]
                ].map(([number, label]) => (
                    <div key={number}>
                        <span>{number}</span>
                        <strong>{label}</strong>
                    </div>
                ))}
            </section>


            <section className="section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Recent Missions
                        </h2>

                        <p>
                            Your latest inspections
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
                                No inspections yet. Start your first UAV inspection.
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
                                            {farms.find((farm) => farm.id === mission.farm_id)?.farm_name || "Farm"}
                                        </div>


                                        <div className="completed">

                                            {" "}
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
                        Inspections
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

                    <h2>Start a New Inspection</h2>

                    <p>
                        Select your farm, name the inspection, and upload UAV footage for AI-powered pest analysis.
                    </p>

                    <label className="inspection-field-label">
                        Select Farm
                    </label>
                    <select
                        value={selectedFarmId}
                        onChange={(event) => setSelectedFarmId(event.target.value)}
                        style={{
                            padding: "12px",
                            width: "60%",
                            marginRight: "10px",
                            marginBottom: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc"
                        }}
                    >
                        <option value="">Select a farm</option>
                        {farms.map((farm) => (
                            <option key={farm.id} value={farm.id}>
                                {farm.farm_name} · {farm.crop_type}
                            </option>
                        ))}
                    </select>

                    {selectedFarmId && (
                        <div className="selected-farm-context">
                            {currentFarm?.farm_name} · {currentFarm?.crop_type} · {currentFarm?.area} acres · {currentFarm?.season || "Season not recorded"}
                        </div>
                    )}

                    <label className="inspection-field-label" htmlFor="mission-name">
                        Mission / Inspection Name
                    </label>
                    <input
                        id="mission-name"
                        name="mission_name"
                        type="text"
                        minLength={3}
                        maxLength={100}
                        placeholder="e.g. Cotton Field Inspection"
                        value={missionName}
                        onChange={(event) => setMissionName(event.target.value)}
                        className="inspection-name-input"
                        required
                    />
                    <small className="inspection-helper">
                        Give this inspection a name so you can easily identify it later.
                    </small>


                    <button
                        className="primary-button"
                        onClick={
                            handleCreateMission
                        }
                        disabled={creatingMission}
                    >

                        {creatingMission
                            ? "Creating..."
                            : "Start AI Analysis"
                        }

                    </button>

                </div>

                {createdMission && (
                    <div className="mission-confirmation">
                        <span>Inspection Created Successfully</span>
                        <strong>{createdMission.name}</strong>
                        <small>Mission ID: #{createdMission.id} · {createdMission.farm?.farm_name || "Selected farm"} · Pending</small>
                    </div>
                )}


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
                                    {farms.find((farm) => farm.id === mission.farm_id)?.farm_name || "Farm"}
                                </div>


                                <div className="completed">

                                    {" "}
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
                        Upload Footage
                    </h1>

                    <p>
                        Upload UAV footage for AI pest detection.
                    </p>

                </div>


                <div className="system-status">

                    <div className="status-dot"></div>

                    AI System Online

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

            {createdMission && (
                <div className="mission-confirmation">
                    <span>Inspection Created Successfully</span>
                    <strong>{createdMission.name}</strong>
                    <small>
                        Mission ID: #{createdMission.id} · {createdMission.farm?.farm_name || "Selected farm"} · Pending
                    </small>
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
                        Start a UAV Inspection
                    </h2>

                    <p>
                        Upload drone footage of your crop area for AI-powered pest analysis.
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

                            AI is extracting frames and
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
            Number(severity?.severity_score || 0);

        const averageConfidence =
            Number(severity?.average_confidence || 0);

        const detectedPests =
            Array.isArray(severity?.detected_pests)
                ? severity.detected_pests
                : [];

        const zonesData =
            resultData?.zones || null;

        const zones =
            Array.isArray(zonesData?.zones)
                ? zonesData.zones
                : [];

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


                    <div className="system-status">

                        <div className="status-dot"></div>

                        AI System Online

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
                            justifyContent: "space-between",
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
                                border: "1px solid #ccc"
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
                                    marginBottom: "20px"
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

                                    {"  "}

                                    Status:{" "}
                                    {
                                        selectedMission.status
                                    }

                                </p>

                                {selectedMission.status === "Completed" && (
                                    <button
                                        className="view-button"
                                        onClick={() => handleDownloadReport(selectedMission.id)}
                                        disabled={downloadingReport}
                                    >
                                        {downloadingReport ? "Preparing report..." : "Download mission report"}
                                    </button>
                                )}

                            </div>


                            <section className="stats-grid">

                                <div className="stat-card">

                                    <div>

                                    </div>

                                    <div>

                                        <span>
                                            Total Detections
                                        </span>

                                        <strong>
                                            {
                                                totalDetectionsForMission
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div className="stat-card">

                                    <div>

                                    </div>

                                    <div>

                                        <span>
                                            Frames Analysed
                                        </span>

                                        <strong>
                                            {
                                                results.length
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </section>

                            {/* AI SEVERITY ASSESSMENT */}

                            {severity && (

                                <section className="section">

                                    <div
                                        style={{
                                            padding: "25px",
                                            borderRadius: "12px",
                                            background: "#ffffff",
                                            border: "1px solid #dcebd5",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                gap: "20px"
                                            }}
                                        >

                                            <div>

                                                <small
                                                    style={{
                                                        fontWeight: 700,
                                                        letterSpacing: "0.08em"
                                                    }}
                                                >
                                                    AI FIELD RISK ASSESSMENT
                                                </small>

                                                <h2
                                                    style={{
                                                        margin: "8px 0"
                                                    }}
                                                >
                                                    {severityLevel}
                                                </h2>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: "#666"
                                                    }}
                                                >
                                                    Detection-based pest risk assessment
                                                </p>

                                            </div>


                                            <div
                                                style={{
                                                    minWidth: "150px",
                                                    textAlign: "center",
                                                    padding: "15px 20px",
                                                    borderRadius: "12px",
                                                    background: "#f5f7f4"
                                                }}
                                            >

                                                <small>
                                                    RISK SCORE
                                                </small>

                                                <div
                                                    style={{
                                                        fontSize: "32px",
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    {severityScore.toFixed(1)}
                                                </div>

                                                <small>
                                                    / 100
                                                </small>

                                            </div>

                                        </div>


                                        {/* METRICS */}

                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(auto-fit, minmax(160px, 1fr))",
                                                gap: "15px",
                                                marginTop: "25px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    padding: "15px",
                                                    background: "#f8faf8",
                                                    borderRadius: "10px"
                                                }}
                                            >

                                                <small>
                                                    Total Detections
                                                </small>

                                                <strong
                                                    style={{
                                                        display: "block",
                                                        fontSize: "22px",
                                                        marginTop: "5px"
                                                    }}
                                                >
                                                    {severity.total_detections ??
                                                        totalDetectionsForMission}
                                                </strong>

                                            </div>


                                            <div
                                                style={{
                                                    padding: "15px",
                                                    background: "#f8faf8",
                                                    borderRadius: "10px"
                                                }}
                                            >

                                                <small>
                                                    Average Confidence
                                                </small>

                                                <strong
                                                    style={{
                                                        display: "block",
                                                        fontSize: "22px",
                                                        marginTop: "5px"
                                                    }}
                                                >
                                                    {(averageConfidence * 100).toFixed(1)}%
                                                </strong>

                                            </div>


                                            <div
                                                style={{
                                                    padding: "15px",
                                                    background: "#f8faf8",
                                                    borderRadius: "10px"
                                                }}
                                            >

                                                <small>
                                                    Pest Types
                                                </small>

                                                <strong
                                                    style={{
                                                        display: "block",
                                                        fontSize: "22px",
                                                        marginTop: "5px"
                                                    }}
                                                >
                                                    {detectedPests.length}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* DETECTED PESTS */}

                                        {detectedPests.length > 0 && (

                                            <div
                                                style={{
                                                    marginTop: "20px"
                                                }}
                                            >

                                                <strong>
                                                    Detected Pests
                                                </strong>


                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: "8px",
                                                        marginTop: "10px"
                                                    }}
                                                >

                                                    {detectedPests.map(
                                                        (pest) => (

                                                            <span
                                                                key={pest}
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
                                                                {pest}
                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        )}


                                        {/* EXPLANATION */}

                                        {severity.note && (

                                            <p
                                                style={{
                                                    marginTop: "20px",
                                                    marginBottom: 0,
                                                    fontSize: "12px",
                                                    color: "#6b7280"
                                                }}
                                            >
                                                {severity.note}
                                            </p>

                                        )}

                                    </div>

                                </section>

                            )}

                            {/* RISK ZONE MAP */}

                            {zones.length > 0 && (

                                <section className="section">

                                    <div
                                        style={{
                                            padding: "25px",
                                            borderRadius: "12px",
                                            background: "#ffffff",
                                            border: "1px solid #dcebd5",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                gap: "15px",
                                                marginBottom: "20px"
                                            }}
                                        >

                                            <div>

                                                <small
                                                    style={{
                                                        fontWeight: 700,
                                                        letterSpacing: "0.08em"
                                                    }}
                                                >
                                                    SPATIAL PEST RISK
                                                </small>

                                                <h2
                                                    style={{
                                                        margin: "8px 0"
                                                    }}
                                                >
                                                    Risk Zone Map
                                                </h2>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: "#666"
                                                    }}
                                                >
                                                    Image-based 3?3 demonstration risk zoning
                                                </p>

                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "12px",
                                                    flexWrap: "wrap",
                                                    fontSize: "13px",
                                                    fontWeight: 600
                                                }}
                                            >

                                                <span>Low Risk</span>
                                                <span>Moderate Risk</span>
                                                <span>High Risk</span>

                                            </div>

                                        </div>


                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(3, minmax(90px, 1fr))",
                                                gap: "8px",
                                                maxWidth: "520px",
                                                margin: "0 auto"
                                            }}
                                        >

                                            {zones.map((zone) => {

                                                const riskLevel =
                                                    zone.risk_level || "LOW";

                                                const background =
                                                    riskLevel === "HIGH"
                                                        ? "#f8d7da"
                                                        : riskLevel === "MODERATE"
                                                            ? "#fff3cd"
                                                            : "#dff3df";

                                                const border =
                                                    riskLevel === "HIGH"
                                                        ? "#dc3545"
                                                        : riskLevel === "MODERATE"
                                                            ? "#e0a800"
                                                            : "#4caf50";

                                                const icon =
                                                    riskLevel === "HIGH"
                                                        ? "HIGH"
                                                        : riskLevel === "MODERATE"
                                                            ? "MODERATE"
                                                            : "LOW";

                                                return (

                                                    <div
                                                        key={zone.zone}
                                                        style={{
                                                            minHeight: "120px",
                                                            padding: "15px",
                                                            borderRadius: "10px",
                                                            background,
                                                            border: `2px solid ${border}`,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            textAlign: "center"
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                fontSize: "24px"
                                                            }}
                                                        >
                                                            {icon}
                                                        </div>

                                                        <strong>
                                                            Zone {zone.zone}
                                                        </strong>

                                                        <span
                                                            style={{
                                                                fontSize: "13px",
                                                                marginTop: "4px"
                                                            }}
                                                        >
                                                            {riskLevel}
                                                        </span>

                                                        <span
                                                            style={{
                                                                fontSize: "12px",
                                                                marginTop: "5px"
                                                            }}
                                                        >
                                                            {zone.total_detections} detections
                                                        </span>

                                                    </div>

                                                );

                                            })}

                                        </div>


                                        {zonesData.summary && (

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    gap: "20px",
                                                    flexWrap: "wrap",
                                                    marginTop: "20px",
                                                    fontSize: "13px",
                                                    fontWeight: 600
                                                }}
                                            >

                                                <span>
                                                    High:{" "}
                                                    {zonesData.summary.high_risk_zone_count}
                                                </span>

                                                <span>
                                                    Moderate:{" "}
                                                    {zonesData.summary.moderate_risk_zone_count}
                                                </span>

                                                <span>
                                                    Low:{" "}
                                                    {zonesData.summary.low_risk_zone_count}
                                                </span>

                                            </div>

                                        )}


                                        <p
                                            style={{
                                                marginTop: "20px",
                                                marginBottom: 0,
                                                fontSize: "12px",
                                                color: "#6b7280"
                                            }}
                                        >
                                            {zonesData.note}
                                        </p>

                                    </div>

                                </section>

                            )}

                            <section className="section">

                                <div className="mission-table">

                                    <div className="table-header">

                                        <div>
                                            Pest
                                        </div>

                                        <div>
                                            Confidence
                                        </div>

                                        <div>
                                            Frame
                                        </div>

                                        <div>
                                            Bounding Box
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
                                                            detection.bbox;


                                                        return (

                                                            <div
                                                                className="mission-row"
                                                                key={
                                                                    `${frameIndex}-${detectionIndex}`
                                                                }
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
                                                                                detection.confidence *
                                                                                100
                                                                            ).toFixed(
                                                                                1
                                                                            )
                                                                        }
                                                                        %
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
                                                                                bbox.x1.toFixed(
                                                                                    2
                                                                                )
                                                                            }

                                                                            {" | "}

                                                                            y1:{" "}
                                                                            {
                                                                                bbox.y1.toFixed(
                                                                                    2
                                                                                )
                                                                            }

                                                                            {" | "}

                                                                            x2:{" "}
                                                                            {
                                                                                bbox.x2.toFixed(
                                                                                    2
                                                                                )
                                                                            }

                                                                            {" | "}

                                                                            y2:{" "}
                                                                            {
                                                                                bbox.y2.toFixed(
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


                            <section className="section">

                                <div
                                    style={{
                                        padding: "25px",
                                        borderRadius: "12px",
                                        background: "#f1f8ee",
                                        border: "1px solid #dcebd5"
                                    }}
                                >

                                    <h2>
                                        Agricultural Spray Advisory
                                    </h2>

                                    <p>
                                        Guidance is based on the configured agricultural advisory dataset.
                                    </p>

                                    {(resultData?.spray_advisories || []).length === 0 ? (
                                        <p>No advisory record is available for this mission.</p>
                                    ) : (
                                        resultData.spray_advisories.map((advisory) => (
                                            <div className="advisory-item" key={advisory.pest}>
                                                <h3>{advisory.pest}</h3>
                                                <p><strong>Status:</strong> {advisory.advisory_status || "Not available"}</p>
                                                <p><strong>Monitor:</strong> {advisory.monitoring || "Not available"}</p>
                                                <p><strong>Action:</strong> {advisory.action || "Not available"}</p>
                                                <p><strong>Intervention:</strong> {advisory.intervention || "Not available"}</p>
                                                <p><strong>Recommendation class:</strong> {advisory.recommendation_class || "Not available"}</p>
                                                <p><strong>Economic threshold:</strong> {advisory.economic_threshold || "Not available"}</p>
                                                <p><strong>Active ingredient:</strong> {advisory.active_ingredient || "Not available"}</p>
                                                <p><strong>Formulation:</strong> {advisory.formulation || "Not available"}</p>
                                                <p><strong>Dose:</strong> {advisory.dose || "Not available"}</p>
                                                <p><strong>Application:</strong> {advisory.application_method || "Not available"}</p>
                                                <small>Source: {advisory.source || "Not available"} · Evidence: {advisory.evidence_type || "Not available"}</small>
                                            </div>
                                        ))
                                    )}

                                    <small>
                                        AgroGuard AI provides decision-support
                                        information. Chemical application should
                                        follow local agricultural guidance and
                                        product-label instructions.
                                    </small>

                                </div>

                            </section>

                        </>

                    ) : (

                        <div
                            style={{
                                padding: "30px",
                                textAlign: "center"
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

    const FarmsPage = () => (
        <>
            <header className="topbar">
                <div>
                    <h1>My Farms</h1>
                    <p>Keep your fields ready for their next UAV inspection.</p>
                </div>
                <div className="system-status">
                    <div className="status-dot"></div>
                    Farmer workspace
                </div>
            </header>

            <section className="section farm-grid">
                {farms.length === 0 ? (
                    <div className="empty-state">
                        <h2>Add your first farm</h2>
                        <p>Register a field before starting an inspection.</p>
                    </div>
                ) : farms.map((farm) => {
                    const farmMissions = missions.filter(
                        (mission) => mission.farm_id === farm.id
                    );
                    const latestMission = farmMissions[0];
                    return (
                        <button
                            className={`farm-card ${selectedFarmId === String(farm.id) ? "selected" : ""}`}
                            key={farm.id}
                            onClick={() => setSelectedFarmId(String(farm.id))}
                            style={{ "--farm-image": `url(${heroImage})` }}
                        >
                            <span className="farm-card-image" aria-hidden="true" />
                            <span className="farm-card-label">FIELD {farm.id}</span>
                            <h2>{farm.farm_name}</h2>
                            <p>{farm.crop_type} · {farm.area} acres</p>
                            <p>{farm.farm_type || "Farm type not recorded"} · {farm.season || "Season not recorded"}</p>
                            <p>Location: {farm.latitude}, {farm.longitude}</p>
                            <small>{farmMissions.length} inspections · {latestMission?.status || "No inspection yet"}</small>
                        </button>
                    );
                })}
            </section>

            <section className="section farm-form-panel">
                <div className="section-heading">
                    <div>
                        <h2>Add Farm</h2>
                        <p>Register the field details used by your inspection reports.</p>
                    </div>
                </div>
                <form className="farm-form" onSubmit={handleCreateFarm}>
                    {[
                        ["farm_name", "Farm name", "text"],
                        ["area", "Area (acres)", "number"],
                        ["latitude", "Latitude", "number"],
                        ["longitude", "Longitude", "number"]
                    ].map(([name, label, type]) => (
                        <label key={name}>
                            {label}
                            <input
                                name={name}
                                type={type}
                                step={type === "number" ? "any" : undefined}
                                value={farmForm[name]}
                                onChange={handleFarmFormChange}
                                required
                            />
                        </label>
                    ))}
                    <label>
                        Crop
                        <select name="crop_type" value={farmForm.crop_type} onChange={handleFarmFormChange} required>
                            <option value="">Select crop</option>
                            {['Cotton', 'Rice', 'Wheat', 'Maize', 'Soybean', 'Sugarcane', 'Tomato', 'Potato', 'Groundnut', 'Chickpea', 'Pigeon Pea', 'Other'].map((crop) => <option key={crop}>{crop}</option>)}
                        </select>
                    </label>
                    <label>
                        Farm type
                        <select name="farm_type" value={farmForm.farm_type} onChange={handleFarmFormChange} required>
                            <option value="">Select farm type</option>
                            {['Owned Farm', 'Leased Farm', 'Family Farm', 'Cooperative Farm', 'Organic Farm', 'Commercial Farm', 'Smallholder Farm'].map((type) => <option key={type}>{type}</option>)}
                        </select>
                    </label>
                    <label>
                        Season
                        <select name="season" value={farmForm.season} onChange={handleFarmFormChange} required>
                            <option value="">Select season</option>
                            {['Kharif', 'Rabi', 'Zaid', 'Year-round'].map((season) => <option key={season}>{season}</option>)}
                        </select>
                    </label>
                    <button className="primary-button" type="submit" disabled={creatingFarm}>
                        {creatingFarm ? "Adding farm..." : "+ Add Farm"}
                    </button>
                </form>
            </section>
        </>
    );

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
                return <FarmsPage />;

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

                    <div>

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

                    <button
                        className={
                            `nav-item ${activePage === "dashboard"
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

                        <span>

                        </span>

                        Dashboard

                    </button>


                    <button
                        className={
                            `nav-item ${activePage === "farms"
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

                        <span>

                        </span>

                        Farms

                    </button>


                    <button
                        className={
                            `nav-item ${activePage === "farmers"
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

                        <span>

                        </span>

                        Farmers

                    </button>


                    <button
                        className={
                            `nav-item ${activePage === "missions"
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

                        <span>

                        </span>

                        Missions

                    </button>


                    <button
                        className={
                            `nav-item ${activePage === "video"
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

                        <span>

                        </span>

                        Video Analysis

                    </button>


                    <button
                        className={
                            `nav-item ${activePage === "results"
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

                        <span>

                        </span>

                        Inspection Results

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


export default AgroGuardDashboard;
