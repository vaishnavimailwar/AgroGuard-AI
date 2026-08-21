import { Link } from "react-router-dom";
import "./Specialists.css";

function Specialists() {
    return (
        <div className="specialists-page">

            {/* HERO */}

            <section className="specialists-hero">

                <div className="specialists-container">

                    <div className="specialists-hero-grid">

                        <div className="specialists-hero-copy">

                            <div className="specialists-eyebrow">
                                AGRICULTURAL SPECIALIST NETWORK
                            </div>

                            <h1>
                                Technology
                                <br />
                                meets
                                <span> expertise.</span>
                            </h1>

                            <p>
                                AgroGuard-AI helps connect field intelligence
                                with agricultural specialists so complex
                                crop problems can receive informed human
                                attention.
                            </p>

                            <div className="specialists-actions">

                                <Link
                                    to="/workflow"
                                    className="specialists-btn specialists-btn-primary"
                                >
                                    Explore the workflow
                                    <span>→</span>
                                </Link>

                                <Link
                                    to="/portal"
                                    className="specialists-btn specialists-btn-secondary"
                                >
                                    Farmer Portal
                                </Link>

                            </div>

                        </div>


                        <div className="specialists-visual">

                            <div className="specialists-orbit orbit-one" />
                            <div className="specialists-orbit orbit-two" />
                            <div className="specialists-orbit orbit-three" />

                            <div className="specialists-center">

                                <div className="specialists-center-icon">
                                    AI
                                </div>

                                <strong>
                                    AgroGuard
                                </strong>

                                <span>
                                    Field Intelligence
                                </span>

                            </div>


                            <div className="specialist-node node-one">
                                <strong>AI</strong>
                                <span>Detection</span>
                            </div>

                            <div className="specialist-node node-two">
                                <strong>01</strong>
                                <span>Field</span>
                            </div>

                            <div className="specialist-node node-three">
                                <strong>02</strong>
                                <span>Expert</span>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* INTRO */}

            <section className="specialists-section">

                <div className="specialists-container">

                    <div className="specialists-section-head">

                        <div>
                            <span className="specialists-label">
                                WHY SPECIALIST SUPPORT
                            </span>

                            <h2>
                                AI can identify.
                                <br />
                                <em>Experts interpret.</em>
                            </h2>
                        </div>

                        <p>
                            Agricultural decisions often depend on context.
                            AgroGuard-AI is designed to provide specialists
                            with field-level information that makes expert
                            assessment faster and more informed.
                        </p>

                    </div>


                    <div className="specialists-feature-grid">

                        <article className="specialist-feature">

                            <span>01</span>

                            <div>
                                <h3>Field evidence</h3>

                                <p>
                                    Drone imagery and AI analysis provide
                                    a visual starting point for understanding
                                    what is happening across the field.
                                </p>
                            </div>

                        </article>


                        <article className="specialist-feature">

                            <span>02</span>

                            <div>
                                <h3>Risk context</h3>

                                <p>
                                    Detected problem areas can be organised
                                    according to severity and spatial risk.
                                </p>
                            </div>

                        </article>


                        <article className="specialist-feature">

                            <span>03</span>

                            <div>
                                <h3>Human decision support</h3>

                                <p>
                                    Specialists can use the generated
                                    information to support recommendations
                                    and field-level decisions.
                                </p>
                            </div>

                        </article>

                    </div>

                </div>

            </section>


            {/* WORKFLOW */}

            <section className="specialists-workflow">

                <div className="specialists-container">

                    <div className="specialists-label">
                        SPECIALIST WORKFLOW
                    </div>

                    <h2>
                        From detection
                        <br />
                        to <em>expert action.</em>
                    </h2>


                    <div className="specialist-process">

                        <div className="process-step">
                            <div className="process-number">
                                01
                            </div>

                            <h3>
                                Field monitoring
                            </h3>

                            <p>
                                Drone imagery captures the agricultural
                                area for analysis.
                            </p>
                        </div>


                        <div className="process-line" />


                        <div className="process-step">
                            <div className="process-number">
                                02
                            </div>

                            <h3>
                                AI assessment
                            </h3>

                            <p>
                                The system identifies potential crop
                                threats and affected areas.
                            </p>
                        </div>


                        <div className="process-line" />


                        <div className="process-step">
                            <div className="process-number">
                                03
                            </div>

                            <h3>
                                Specialist review
                            </h3>

                            <p>
                                Agricultural expertise can be applied
                                to the generated field information.
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            {/* CTA */}

            <section className="specialists-cta">

                <div className="specialists-container">

                    <div className="specialists-cta-box">

                        <div>
                            <span className="specialists-label">
                                AGROGUARD-AI
                            </span>

                            <h2>
                                Better field data.
                                <br />
                                Better decisions.
                            </h2>
                        </div>

                        <Link
                            to="/portal"
                            className="specialists-btn specialists-btn-primary"
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

export default Specialists;