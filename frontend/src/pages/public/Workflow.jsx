import { Link } from "react-router-dom";
import "./Workflow.css";

function Workflow() {
    const steps = [
        {
            number: "01",
            title: "Farm Setup",
            text: "Define the monitored field and establish the mission area for drone-based observation.",
            tag: "MISSION",
        },
        {
            number: "02",
            title: "Drone Monitoring",
            text: "Capture aerial imagery across the selected agricultural area.",
            tag: "UAV",
        },
        {
            number: "03",
            title: "AI Detection",
            text: "Analyse captured imagery to identify potential crop disease and pest-affected areas.",
            tag: "AI / ML",
        },
        {
            number: "04",
            title: "Spatial Risk",
            text: "Organise detected threats spatially so affected zones can be understood at field level.",
            tag: "MAPPING",
        },
        {
            number: "05",
            title: "Severity Assessment",
            text: "Estimate the severity of detected crop problems and prioritise areas requiring attention.",
            tag: "ASSESSMENT",
        },
        {
            number: "06",
            title: "Advisory & Report",
            text: "Convert analysed information into actionable advisory information and mission reporting.",
            tag: "DECISION",
        },
    ];

    return (
        <div className="workflow-page">

            <section className="workflow-hero">
                <div className="workflow-container">

                    <div className="workflow-hero-grid">

                        <div>
                            <div className="workflow-eyebrow">
                                AGROGUARD-AI FIELD WORKFLOW
                            </div>

                            <h1>
                                From flight
                                <br />
                                to <span>field action.</span>
                            </h1>

                            <p>
                                A connected workflow that transforms aerial
                                observation into structured agricultural
                                intelligence.
                            </p>

                            <div className="workflow-actions">
                                <Link
                                    to="/portal"
                                    className="workflow-btn workflow-btn-primary"
                                >
                                    Start a mission
                                    <span>→</span>
                                </Link>

                                <Link
                                    to="/solutions"
                                    className="workflow-btn workflow-btn-secondary"
                                >
                                    Explore solutions
                                </Link>
                            </div>
                        </div>

                        <div className="workflow-visual">

                            <div className="workflow-field">
                                <div className="field-grid" />

                                <div className="field-zone zone-green" />
                                <div className="field-zone zone-yellow" />
                                <div className="field-zone zone-red" />

                                <div className="drone-marker">
                                    <span>UAV</span>
                                </div>

                                <div className="field-label label-one">
                                    LOW RISK
                                </div>

                                <div className="field-label label-two">
                                    MONITOR
                                </div>

                                <div className="field-label label-three">
                                    ATTENTION
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>


            <section className="workflow-section">

                <div className="workflow-container">

                    <div className="workflow-heading">

                        <div>
                            <span className="workflow-label">
                                THE PROCESS
                            </span>

                            <h2>
                                One mission.
                                <br />
                                <em>Six connected stages.</em>
                            </h2>
                        </div>

                        <p>
                            AgroGuard-AI separates the agricultural
                            monitoring process into clear stages so each
                            output can feed the next decision.
                        </p>

                    </div>


                    <div className="workflow-grid">

                        {steps.map((step) => (
                            <article
                                className="workflow-card"
                                key={step.number}
                            >
                                <div className="workflow-card-top">
                                    <span>{step.number}</span>
                                    <small>{step.tag}</small>
                                </div>

                                <div className="workflow-card-icon">
                                    {step.number}
                                </div>

                                <h3>{step.title}</h3>

                                <p>{step.text}</p>

                                <div className="workflow-card-arrow">
                                    →
                                </div>
                            </article>
                        ))}

                    </div>

                </div>
            </section>


            <section className="workflow-output">

                <div className="workflow-container">

                    <div className="workflow-output-box">

                        <div>
                            <span className="workflow-label">
                                FINAL OUTPUT
                            </span>

                            <h2>
                                Intelligence that
                                <br />
                                supports <em>action.</em>
                            </h2>

                            <p>
                                The workflow brings field observations,
                                AI analysis, risk information and advisory
                                outputs together into one mission record.
                            </p>
                        </div>

                        <div className="workflow-output-list">

                            <div>
                                <span>01</span>
                                <strong>Detection results</strong>
                            </div>

                            <div>
                                <span>02</span>
                                <strong>Risk information</strong>
                            </div>

                            <div>
                                <span>03</span>
                                <strong>Advisory support</strong>
                            </div>

                            <div>
                                <span>04</span>
                                <strong>Mission report</strong>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <section className="workflow-cta">

                <div className="workflow-container">

                    <div className="workflow-cta-inner">

                        <div>
                            <span className="workflow-label">
                                READY TO EXPLORE
                            </span>

                            <h2>
                                See what AgroGuard
                                <br />
                                can do for your field.
                            </h2>
                        </div>

                        <Link
                            to="/portal"
                            className="workflow-btn workflow-btn-primary"
                        >
                            Enter Farmer Portal
                            <span>→</span>
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Workflow;