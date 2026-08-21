import { Link } from "react-router-dom";
import "./Farmers.css";

function Farmers() {
    const benefits = [
        {
            number: "01",
            title: "See your field",
            text: "Use aerial monitoring to understand what is happening across larger agricultural areas."
        },
        {
            number: "02",
            title: "Find problems earlier",
            text: "AI-assisted analysis helps identify potential crop threats from captured imagery."
        },
        {
            number: "03",
            title: "Understand the risk",
            text: "Detected areas can be organised into understandable risk and severity information."
        },
        {
            number: "04",
            title: "Act with confidence",
            text: "Receive structured advisory information that supports practical field decisions."
        }
    ];

    return (
        <div className="farmers-page">

            {/* HERO */}

            <section className="farmers-hero">

                <div className="farmers-hero-image" />
                <div className="farmers-hero-overlay" />

                <div className="farmers-container">

                    <div className="farmers-hero-content">

                        <span className="farmers-eyebrow">
                            BUILT FOR THE FARM
                        </span>

                        <h1>
                            Technology that
                            <br />
                            <em>works for farmers.</em>
                        </h1>

                        <p>
                            AgroGuard-AI turns drone imagery and artificial
                            intelligence into information that is easier
                            to understand, act on and share.
                        </p>

                        <div className="farmers-actions">

                            <Link
                                to="/portal"
                                className="farmers-btn farmers-btn-primary"
                            >
                                Open Farmer Portal
                                <span>→</span>
                            </Link>

                            <Link
                                to="/workflow"
                                className="farmers-btn farmers-btn-ghost"
                            >
                                How it works
                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* INTRO */}

            <section className="farmers-intro">

                <div className="farmers-container">

                    <div className="farmers-intro-grid">

                        <div>

                            <span className="farmers-label">
                                THE FARMER EXPERIENCE
                            </span>

                            <h2>
                                Less guesswork.
                                <br />
                                <em>More visibility.</em>
                            </h2>

                        </div>

                        <div className="farmers-intro-copy">

                            <p className="farmers-lead">
                                Agricultural decisions often begin with
                                what can be seen in the field.
                            </p>

                            <p>
                                AgroGuard-AI adds another layer of visibility
                                by combining aerial monitoring, AI-assisted
                                detection and structured decision support.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* BENEFITS */}

            <section className="farmers-benefits">

                <div className="farmers-container">

                    <div className="farmers-section-head">

                        <div>
                            <span className="farmers-label">
                                FROM DATA TO ACTION
                            </span>

                            <h2>
                                Information that
                                <br />
                                stays <em>useful.</em>
                            </h2>
                        </div>

                        <p>
                            The system is designed to move from observation
                            to understandable field information without
                            overwhelming the farmer.
                        </p>

                    </div>


                    <div className="farmers-benefit-grid">

                        {benefits.map((benefit) => (
                            <article
                                className="farmers-benefit-card"
                                key={benefit.number}
                            >

                                <div className="farmers-benefit-number">
                                    {benefit.number}
                                </div>

                                <div className="farmers-benefit-line" />

                                <h3>
                                    {benefit.title}
                                </h3>

                                <p>
                                    {benefit.text}
                                </p>

                            </article>
                        ))}

                    </div>

                </div>

            </section>


            {/* FIELD INTELLIGENCE */}

            <section className="farmers-intelligence">

                <div className="farmers-container">

                    <div className="farmers-intelligence-grid">

                        <div className="farmers-field-visual">

                            <div className="field-grid" />

                            <div className="field-shape field-shape-a" />
                            <div className="field-shape field-shape-b" />
                            <div className="field-shape field-shape-c" />

                            <div className="field-label field-label-a">
                                LOW RISK
                            </div>

                            <div className="field-label field-label-b">
                                MONITOR
                            </div>

                            <div className="field-label field-label-c">
                                HIGH RISK
                            </div>

                            <div className="field-location">
                                <span>FIELD ANALYSIS</span>
                                <strong>Mission 001</strong>
                                <small>AI assessment available</small>
                            </div>

                        </div>


                        <div className="farmers-intelligence-copy">

                            <span className="farmers-label">
                                FIELD INTELLIGENCE
                            </span>

                            <h2>
                                Understand
                                <br />
                                <em>where to look.</em>
                            </h2>

                            <p>
                                A field does not always have the same level
                                of risk. AgroGuard-AI helps organise detected
                                areas so attention can be directed where it
                                matters most.
                            </p>

                            <div className="farmers-risk-list">

                                <div>
                                    <span className="risk-dot risk-low" />
                                    <strong>Low risk</strong>
                                    <small>Continue monitoring</small>
                                </div>

                                <div>
                                    <span className="risk-dot risk-medium" />
                                    <strong>Moderate risk</strong>
                                    <small>Inspect the affected area</small>
                                </div>

                                <div>
                                    <span className="risk-dot risk-high" />
                                    <strong>High risk</strong>
                                    <small>Prioritise field attention</small>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* SIMPLE WORKFLOW */}

            <section className="farmers-process">

                <div className="farmers-container">

                    <div className="farmers-process-head">

                        <span className="farmers-label">
                            SIMPLE PROCESS
                        </span>

                        <h2>
                            From your field
                            <br />
                            to your <em>decision.</em>
                        </h2>

                    </div>


                    <div className="farmers-process-grid">

                        <div>
                            <strong>01</strong>
                            <h3>Capture</h3>
                            <p>Collect aerial imagery of the agricultural area.</p>
                        </div>

                        <div>
                            <strong>02</strong>
                            <h3>Analyse</h3>
                            <p>AI-assisted systems analyse the captured information.</p>
                        </div>

                        <div>
                            <strong>03</strong>
                            <h3>Understand</h3>
                            <p>View detections, severity and spatial risk information.</p>
                        </div>

                        <div>
                            <strong>04</strong>
                            <h3>Act</h3>
                            <p>Use the resulting information to support field decisions.</p>
                        </div>

                    </div>

                </div>

            </section>


            {/* CTA */}

            <section className="farmers-cta">

                <div className="farmers-container">

                    <div className="farmers-cta-box">

                        <div>
                            <span className="farmers-label">
                                READY WHEN YOU ARE
                            </span>

                            <h2>
                                Give your field
                                <br />
                                a clearer <em>view.</em>
                            </h2>
                        </div>

                        <Link
                            to="/portal"
                            className="farmers-btn farmers-btn-primary"
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

export default Farmers;