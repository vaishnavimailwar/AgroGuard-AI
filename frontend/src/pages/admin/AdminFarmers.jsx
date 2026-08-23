import { useEffect, useState } from "react";
import "./AdminFarmers.css";

const API_BASE = "http://127.0.0.1:8000";

function AdminFarmers() {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadFarmers = async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/farmers/`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load farmers"
                    );
                }

                setFarmers(data);
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to connect to AgroGuard-AI."
                );
            } finally {
                setLoading(false);
            }
        };

        loadFarmers();
    }, []);

    return (
        <div className="admin-page">

            <div className="admin-page-header">
                <div>
                    <div className="admin-eyebrow">
                        AGROGUARD AI · FARM MANAGEMENT
                    </div>

                    <h1>Farmers</h1>

                    <p>
                        Registered farmer accounts in the AgroGuard system.
                    </p>
                </div>

                <div className="admin-page-count">
                    {loading ? "—" : farmers.length}
                    <span>registered</span>
                </div>
            </div>

            {error && (
                <div className="admin-list-error">
                    {error}
                </div>
            )}

            {loading ? (

                <div className="admin-list-empty">
                    Loading farmer records...
                </div>

            ) : farmers.length === 0 ? (

                <div className="admin-list-empty">
                    No farmers registered yet.
                </div>

            ) : (

                <div className="admin-farmer-table">

                    <div className="admin-farmer-row admin-farmer-heading">
                        <span>ID</span>
                        <span>Name</span>
                        <span>Email</span>
                        <span>Mobile</span>
                        <span>Village</span>
                    </div>

                    {farmers.map((farmer) => (

                        <div
                            className="admin-farmer-row"
                            key={farmer.id}
                        >
                            <span>#{farmer.id}</span>

                            <strong>
                                {farmer.name || "—"}
                            </strong>

                            <span>
                                {farmer.email || "—"}
                            </span>

                            <span>
                                {farmer.mobile || "—"}
                            </span>

                            <span>
                                {farmer.village || "—"}
                            </span>
                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default AdminFarmers;