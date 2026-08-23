import { useEffect, useState } from "react";
import "./AdminMissions.css";

const API_BASE = "http://127.0.0.1:8000";

function AdminMissions() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMissions = async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/missions/`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load missions"
                    );
                }

                setMissions(data);
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to connect to AgroGuard-AI."
                );
            } finally {
                setLoading(false);
            }
        };

        loadMissions();
    }, []);

    return (
        <div className="admin-page">

            <div className="admin-page-header">
                <div>
                    <div className="admin-eyebrow">
                        AGROGUARD AI · MISSION MANAGEMENT
                    </div>

                    <h1>Missions</h1>

                    <p>
                        Monitor UAV agricultural missions and processing status.
                    </p>
                </div>

                <div className="admin-page-count">
                    {loading ? "—" : missions.length}
                    <span>missions</span>
                </div>
            </div>

            {error && (
                <div className="admin-list-error">
                    {error}
                </div>
            )}

            {loading ? (

                <div className="admin-list-empty">
                    Loading mission records...
                </div>

            ) : missions.length === 0 ? (

                <div className="admin-list-empty">
                    No missions created yet.
                </div>

            ) : (

                <div className="admin-mission-table">

                    <div className="admin-mission-row admin-mission-heading">
                        <span>ID</span>
                        <span>Mission</span>
                        <span>Farmer ID</span>
                        <span>Farm ID</span>
                        <span>Status</span>
                        <span>AI</span>
                    </div>

                    {missions.map((mission) => (

                        <div
                            className="admin-mission-row"
                            key={mission.id}
                        >
                            <span>#{mission.id}</span>

                            <strong>
                                {mission.mission_name || "—"}
                            </strong>

                            <span>
                                {mission.farmer_id ?? "—"}
                            </span>

                            <span>
                                {mission.farm_id ?? "—"}
                            </span>

                            <span className="mission-status">
                                {mission.status || "Pending"}
                            </span>

                            <span>
                                {mission.detection_file
                                    ? "Processed"
                                    : "Pending"}
                            </span>
                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default AdminMissions;