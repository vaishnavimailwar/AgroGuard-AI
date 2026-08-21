import { Link } from "react-router-dom";
import "./About.css";
import "./PublicPages.css";

function About() {
    return (
        <div className="about-page">

            {/* HERO */}

            <section className="public-page-hero about-hero">

                <div className="public-container">

                    <div className="public-page-hero-content">

                        <div className="public-eyebrow">
                            ABOUT AGROGUARD-AI
                        </div>

                        <h1>
                            Intelligence
                            <br />
                            <em>for every field.</em>
                        </h1>

                        <p>
                            AgroGuard-AI connects aerial monitoring,
                            artificial intelligence and agricultural
                            decision support into one practical
                            platform for modern farming.
                        </p>

                    </div>

                </div>

            </section>


            {/* INTRODUCTION */}

            <section className="public-section">

                <div className="public-container">

                    <div className="public-section-label">
                        01 / OUR PURPOSE
                    </div>

                    <div className="public-editorial-grid">

                        <div>

                            <div className="public-lead">
                                Agriculture does not need more
                                disconnected technology. It needs
                                better information at the right time.
                            </div>

                            <div className="public-editorial-copy">

                                <p>
                                    AgroGuard-AI is designed around
                                    a simple principle: transform
                                    field observations into useful
                                    agricultural decisions.
                                </p>

                                <p>
                                    Drone imagery provides the view.
                                    Artificial intelligence provides
                                    the analysis. The platform brings
                                    those insights together so that
                                    farmers and agricultural specialists
                                    can understand what is happening
                                    across the field.
                                </p>

                                <p>
                                    The goal is not simply to detect
                                    a problem. The goal is to help
                                    identify it earlier, understand
                                    its severity and support the next
                                    practical action.
                                </p>

                            </div>

                        </div>


                        <div className="public-stat-grid">

                            <div className="public-stat">
                                <strong>01</strong>
                                <span>
                                    Unified agricultural intelligence
                                </span>
                            </div>

                            <div className="public-stat">
                                <strong>02</strong>
                                <span>
                                    Drone-assisted field monitoring
                                </span>
                            </div>

                            <div className="public-stat">
                                <strong>03</strong>
                                <span>
                                    AI-based crop threat detection
                                </span>
                            </div>

                            <div className="public-stat">
                                <strong>04</strong>
                                <span>
                                    Decision support for farmers
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* PRINCIPLES */}

            <section className="public-section cream">

                <div className="public-container">

                    <div className="public-section-label">
                        02 / DESIGN PRINCIPLES
                    </div>

                    <div className="public-section-heading">

                        <h2>
                            Technology should
                            <br />
                            <em>serve the field.</em>
                        </h2>

                        <p>
                            Every part of AgroGuard-AI is designed
                            around practical agricultural use rather
                            than technology for its own sake.
                        </p>

                    </div>


                    <div className="public-card-grid">

                        <article className="public-card">
                            <div className="public-card-number">
                                01
                            </div>

                            <h3>
                                Earlier awareness
                            </h3>

                            <p>
                                Detect potential crop threats before
                                they become difficult to manage across
                                the field.
                            </p>

                            <div className="public-card-arrow">
                                →
                            </div>
                        </article>


                        <article className="public-card">
                            <div className="public-card-number">
                                02
                            </div>

                            <h3>
                                Actionable intelligence
                            </h3>

                            <p>
                                Convert complex field observations
                                into information that supports
                                practical decisions.
                            </p>

                            <div className="public-card-arrow">
                                →
                            </div>
                        </article>


                        <article className="public-card">
                            <div className="public-card-number">
                                03
                            </div>

                            <h3>
                                Human-centred agriculture
                            </h3>

                            <p>
                                Keep farmers and agricultural experts
                                at the centre of the decision-making
                                process.
                            </p>

                            <div className="public-card-arrow">
                                →
                            </div>
                        </article>

                    </div>

                </div>

            </section>


            {/* DARK STATEMENT */}

            <section className="public-dark-section">

                <div className="public-container">

                    <div className="public-section-label">
                        03 / THE VISION
                    </div>

                    <div className="public-section-heading">

                        <h2>
                            From scattered
                            <br />
                            observations to
                            <br />
                            <em>one clear picture.</em>
                        </h2>

                        <p>
                            AgroGuard-AI brings together field
                            monitoring, AI analysis, risk assessment,
                            spray advisory and reporting into a
                            connected agricultural workflow.
                        </p>

                    </div>

                </div>

            </section>


            {/* CTA */}

            <section className="public-cta">

                <div className="public-container public-cta-content">

                    <div className="public-section-label">
                        EXPLORE THE PLATFORM
                    </div>

                    <h2>
                        See how AgroGuard
                        <br />
                        <em>works in the field.</em>
                    </h2>

                    <p>
                        Explore the complete workflow from drone
                        monitoring to agricultural decision support.
                    </p>

                    <div style={{
                        marginTop: "32px",
                        display: "flex",
                        justifyContent: "center",
                        gap: "12px",
                        flexWrap: "wrap"
                    }}>

                        <Link
                            to="/workflow"
                            className="public-button public-button-primary"
                        >
                            Explore Workflow →
                        </Link>

                        <Link
                            to="/portal"
                            className="public-button public-button-outline"
                        >
                            Enter Farmer Portal
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default About;