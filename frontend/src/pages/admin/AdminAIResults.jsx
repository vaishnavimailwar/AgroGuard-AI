import { useEffect, useState } from "react";
import "./AdminAIResults.css";

const API_BASE = "http://127.0.0.1:8000";

function AdminAIResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadResults = async () => {
            try {
                const missionsResponse = await fetch(
                    `${API_BASE}/missions/`
                );

                const missions = await missionsResponse.json();

                if (!missionsResponse.ok) {
                    throw new Error(
                        missions.detail || "Unable to load missions"
                    );
                }

                const processed = missions.filter(
                    (mission) => mission.detection_file
                );

                const resultResponses = await Promise.all(
                    processed.map(async (mission) => {
                        const response = await fetch(
                            `${API_BASE}/missions/${mission.id}/results`
                        );

                        if (!response.ok) {
                            return null;
                        }

                        const data = await response.json();

                        return {
                            mission,
                            data
                        };
                    })
                );

                setResults(
                    resultResponses.filter(Boolean)
                );

            } catch (err) {
                setError(
                    err.message ||
                    "Unable to load AI results."
                );
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, []);

    const getDetectionCount = (missionData) => {
        return (missionData.results || []).reduce(
            (total, frame) =>
                total + (frame.detections?.length || 0),
            0
        );
    };

    const getPestClasses = (missionData) => {
        const classes = new Set();

        (missionData.results || []).forEach((frame) => {
            (frame.detections || []).forEach((detection) => {
                if (detection.class_name) {
                    classes.add(detection.class_name);
                }
            });
        });

        return [...classes];
    };

    return (
        <div className="admin-page">

            <div className="admin-page-header">
                <div>
                    <div className="admin-eyebrow">
                        AGROGUARD AI · AI INTELLIGENCE
                    </div>

                    <h1>AI Results</h1>

                    <p>
                        Review pest detection, confidence,
                        severity and risk-zone analysis.
                    </p>
                </div>

                <div className="admin-page-count">
                    {loading ? "—" : results.length}
                    <span>processed missions</span>
                </div>
            </div>

            {error && (
                <div className="admin-list-error">
                    {error}
                </div>
            )}

            {loading ? (

                <div className="admin-list-empty">
                    Loading AI results...
                </div>

            ) : results.length === 0 ? (

                <div className="admin-list-empty">
                    No AI results are available yet.
                </div>

            ) : (

                <div className="admin-ai-results-list">

                    {results.map(
                        ({ mission, data }) => {

                            const pestClasses =
                                getPestClasses(data);

                            const detectionCount =
                                getDetectionCount(data);

                            return (
                                <div
                                    className="admin-ai-result-card"
                                    key={mission.id}
                                >

                                    <div className="admin-ai-result-header">

                                        <div>
                                            <span className="admin-ai-mission-id">
                                                MISSION #{mission.id}
                                            </span>

                                            <h2>
                                                {mission.mission_name}
                                            </h2>
                                        </div>

                                        <span className="admin-ai-complete">
                                            AI Processed
                                        </span>

                                    </div>

                                    <div className="admin-ai-result-stats">

                                        <div>
                                            <span>
                                                Detection instances
                                            </span>

                                            <strong>
                                                {detectionCount}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Pest classes
                                            </span>

                                            <strong>
                                                {pestClasses.length
                                                    ? pestClasses.join(", ")
                                                    : "None"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Average confidence
                                            </span>

                                            <strong>
                                                {data.severity?.average_confidence != null
                                                    ? `${(
                                                        data.severity.average_confidence *
                                                        100
                                                    ).toFixed(1)}%`
                                                    : "Available in results"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Severity
                                            </span>

                                            <strong>
                                                {typeof data.severity === "string"
                                                    ? data.severity
                                                    : data.severity?.severity ||
                                                      data.severity?.level ||
                                                      "Calculated"}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="admin-ai-result-footer">

                                        <span>
                                            Frames analyzed:{" "}
                                            {data.results?.length || 0}
                                        </span>

                                        <span>
                                            Zone analysis:{" "}
                                            {data.zones
                                                ? "Available"
                                                : "Not available"}
                                        </span>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}

        </div>
    );
}

export default AdminAIResults;