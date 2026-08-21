import { Link } from "react-router-dom";
import "./Solutions.css";

function Solutions() {
    const solutions = [
        {
            number: "01",
            title: "Farm Management",
            short: "Organise monitored agricultural areas and missions.",
            details: [
                "Field-based mission planning",
                "Mission history",
                "Centralised field information",
            ],
        },
        {
            number: "02",
            title: "AI Crop Detection",
            short: "Identify potential crop disease and pest-affected areas from aerial imagery.",
            details: [
                "Drone image analysis",
                "Disease and pest detection",
                "Affected-area identification",
            ],
        },
        {
            number: "03",
            title: "Spatial Risk Zones",
            short: "Turn detections into understandable field-level risk information.",
            details: [
                "Affected zone mapping",
                "Risk classification",
                "Location-aware analysis",
            ],
        },
        {
            number: "04",
            title: "Severity Assessment",
            short: "Prioritise detected problems according to their estimated severity.",
            details: [
                "Severity classification",
                "Priority areas",
                "Decision support",
            ],
        },
        {
            number: "05",
            title: "Spray Advisory",
            short: "Provide responsible advisory information based on detected crop threats.",
            details: [
                "Problem-based recommendations",
                "Field context",
                "Action-oriented guidance",
            ],
        },
        {
            number: "06",
            title: "Mission Reporting",
            short: "Bring mission findings together into a structured report.",
            details: [
                "Detection summary",
                "Risk information",
                "Mission documentation",
            ],
        },
    ];

    return (
        <div className="solutions-page">

            {/* HERO */}

            <section className="solutions-hero">

                <div className="solutions-container">

                    <div className="solutions-hero-grid">

                        <div className="solutions-hero-copy">

                            <div className="solutions-eyebrow">
                                AGROGUARD-AI PLATFORM
                            </div>

                            <h1>
                                One platform.
                                <br />
                                <span>Multiple layers</span>
                                <br />
                                of field intelligence.
                            </h1>

                            <p>
                                AgroGuard-AI brings monitoring, AI detection,
                                risk assessment, advisory support and reporting
                                into one connected agricultural workflow.
                            </p>

                            <div className="solutions-actions">

                                <Link
                                    to="/portal"
                                    className="solutions-btn solutions-btn-primary"
                                >
                                    Enter Farmer Portal
                                    <span>→</span>
                                </Link>

                                <Link
                                    to="/workflow"
                                    className="solutions-btn solutions-btn-secondary"
                                >
                                    See the workflow
                                </Link>

                            </div>

                        </div>


                        <div className="solutions-dashboard">

                            <div className="dashboard-top">

                                <div>
                                    <span>FIELD INTELLIGENCE</span>
                                    <strong>MISSION 001</strong>
                                </div>

                                <div className="dashboard-status">
                                    ● ACTIVE
                                </div>

                            </div>


                            <div className="dashboard-map">

                                <div className="dashboard-grid" />

                                <div className="map-area map-area-one" />
                                <div className="map-area map-area-two" />
                                <div className="map-area map-area-three" />

                                <div className="map-point point-one" />
                                <div className="map-point point-two" />
                                <div className="map-point point-three" />

                                <div className="map-center">
                                    AI
                                </div>

                            </div>


                            <div className="dashboard-bottom">

                                <div>
                                    <span>AREAS SCANNED</span>
                                    <strong>12</strong>
                                </div>

                                <div>
                                    <span>RISK ZONES</span>
                                    <strong>03</strong>
                                </div>

                                <div>
                                    <span>STATUS</span>
                                    <strong>READY</strong>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* SOLUTIONS */}

            <section className="solutions-section">

                <div className="solutions-container">

                    <div className="solutions-heading">

                        <div>

                            <span className="solutions-label">
                                PLATFORM CAPABILITIES
                            </span>

                            <h2>
                                Designed around
                                <br />
                                the <em>field.</em>
                            </h2>

                        </div>

                        <p>
                            Each capability addresses a different part of
                            the agricultural monitoring process while
                            remaining connected to the same mission.
                        </p>

                    </div>


                    <div className="solutions-grid">

                        {solutions.map((solution) => (
                            <article
                                className="solution-card"
                                key={solution.number}
                            >

                                <div className="solution-card-top">

                                    <span>
                                        {solution.number}
                                    </span>

                                    <small>
                                        AGROGUARD
                                    </small>

                                </div>


                                <div className="solution-icon">
                                    {solution.number}
                                </div>


                                <h3>
                                    {solution.title}
                                </h3>

                                <p>
                                    {solution.short}
                                </p>


                                <div className="solution-details">

                                    {solution.details.map((detail) => (
                                        <div key={detail}>
                                            <span>✓</span>
                                            {detail}
                                        </div>
                                    ))}

                                </div>

                            </article>
                        ))}

                    </div>

                </div>

            </section>


            {/* DATA FLOW */}

            <section className="solutions-flow">

                <div className="solutions-container">

                    <div className="solutions-flow-head">

                        <span className="solutions-label">
                            CONNECTED INTELLIGENCE
                        </span>

                        <h2>
                            Every output becomes
                            <br />
                            the next <em>input.</em>
                        </h2>

                    </div>


                    <div className="solutions-flow-track">

                        <div className="flow-item">
                            <strong>01</strong>
                            <span>Drone imagery</span>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-item">
                            <strong>02</strong>
                            <span>AI detection</span>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-item">
                            <strong>03</strong>
                            <span>Risk assessment</span>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-item">
                            <strong>04</strong>
                            <span>Advisory</span>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-item">
                            <strong>05</strong>
                            <span>Report</span>
                        </div>

                    </div>

                </div>

            </section>


            {/* CTA */}

            <section className="solutions-cta">

                <div className="solutions-container">

                    <div className="solutions-cta-box">

                        <div>

                            <span className="solutions-label">
                                AGROGUARD-AI
                            </span>

                            <h2>
                                Turn field data
                                <br />
                                into <em>better decisions.</em>
                            </h2>

                        </div>

                        <Link
                            to="/portal"
                            className="solutions-btn solutions-btn-primary"
                        >
                            Open Farmer Portal
                            <span>→</span>
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Solutions;