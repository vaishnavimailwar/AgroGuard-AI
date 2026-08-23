import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {

    const navigate = useNavigate();

    return (
        <div className="ag-home">


            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="ag-hero">

                <video
    className="ag-hero-video"
    autoPlay
    muted
    loop
    playsInline
    poster="/assets/agroguard/hero/agroguard-hero.jpg.jpeg"
>
    <source
        src="/assets/agroguard/hero/agroguard-hero.mp4"
        type="video/mp4"
    />
</video>

<div className="ag-hero-shade" />

<div className="ag-hero-pattern" />


                <div className="ag-hero-content">

                    <div className="ag-hero-kicker">

                        <span className="ag-kicker-line" />

                        AI-POWERED AGRICULTURAL INTELLIGENCE

                    </div>


                    <h1>
                        Smarter fields.
                        <br />
                        <em>Healthier</em> harvests.
                    </h1>


                    <p className="ag-hero-description">
                        AgroGuard-AI brings drone-based monitoring,
                        artificial intelligence and agricultural
                        decision support together to help farmers
                        identify crop threats earlier.
                    </p>


                    <div className="ag-hero-actions">

                        <button
                            className="ag-btn ag-btn-primary"
                            onClick={() => navigate("/portal")}
                        >
                            Enter Farmer Portal
                            <span>→</span>
                        </button>


                        <button
                            className="ag-btn ag-btn-ghost"
                            onClick={() => navigate("/workflow")}
                        >
                            Discover AgroGuard
                            <span>↓</span>
                        </button>

                    </div>


                    <div className="ag-hero-note">

                        <span className="ag-live-dot" />

                        Built for modern Indian agriculture

                    </div>

                </div>


                <div className="ag-hero-bottom">

                    <span>
                        AGROGUARD-AI
                    </span>

                    <span className="ag-hero-bottom-line" />

                    <span>
                        UAV · AI · AGRICULTURE
                    </span>

                </div>

            </section>



            {/* =====================================================
                TRUST STRIP
            ===================================================== */}

            <section className="ag-trust-strip">

                <div className="ag-trust-item">

                    <strong>01</strong>

                    <div>
                        <b>UAV Monitoring</b>
                        <span>Aerial crop observation</span>
                    </div>

                </div>


                <div className="ag-trust-item">

                    <strong>02</strong>

                    <div>
                        <b>AI Detection</b>
                        <span>Automated pest identification</span>
                    </div>

                </div>


                <div className="ag-trust-item">

                    <strong>03</strong>

                    <div>
                        <b>Risk Assessment</b>
                        <span>Field-level severity analysis</span>
                    </div>

                </div>


                <div className="ag-trust-item">

                    <strong>04</strong>

                    <div>
                        <b>Actionable Advisory</b>
                        <span>Decision support for farmers</span>
                    </div>

                </div>

            </section>



            {/* =====================================================
                INTRODUCTION
            ===================================================== */}

            <section className="ag-section ag-home-introduction">

                <div className="ag-section-number">
                    01
                </div>


                <div className="ag-about-grid">

                    <div>

                        <div className="ag-label">
                            ABOUT AGROGUARD-AI
                        </div>

                        <h2>
                            Turning what
                            <br />
                            <em>machines see</em>
                            <br />
                            into what farmers need.
                        </h2>

                    </div>


                    <div className="ag-about-copy">

                        <p className="ag-lead">
                            Agriculture is changing. The ability to
                            observe a field from above is no longer
                            enough — farmers need timely intelligence
                            that can support real decisions.
                        </p>


                        <p>
                            AgroGuard-AI connects aerial monitoring,
                            computer vision, risk assessment and
                            agricultural advisory into a single
                            workflow.
                        </p>


                        <button
                            className="ag-text-link"
                            onClick={() => navigate("/about")}
                        >
                            Explore AgroGuard-AI
                            <span>→</span>
                        </button>

                    </div>

                </div>

            </section>



            {/* =====================================================
                WORKFLOW PREVIEW
            ===================================================== */}

            <section className="ag-workflow ag-section">

                <div className="ag-section-heading">

                    <div>

                        <div className="ag-label">
                            THE AGROGUARD WORKFLOW
                        </div>

                        <h2>
                            From flight
                            <br />
                            to <em>field action.</em>
                        </h2>

                    </div>


                    <p>
                        A connected pipeline transforms drone footage
                        into understandable agricultural intelligence.
                    </p>

                </div>


                <div className="ag-workflow-list">


                    <article className="ag-workflow-card">

                        <div className="ag-step-top">
                            <span>01</span>
                            <span>MONITOR</span>
                        </div>

                        <div className="ag-step-icon">
                            ○
                        </div>

                        <h3>
                            Drone Monitoring
                        </h3>

                        <p>
                            Capture aerial imagery and video across
                            the registered agricultural area.
                        </p>

                    </article>


                    <article className="ag-workflow-card ag-workflow-featured">

                        <div className="ag-step-top">
                            <span>02</span>
                            <span>ANALYSE</span>
                        </div>

                        <div className="ag-step-icon">
                            ✦
                        </div>

                        <h3>
                            AI Detection
                        </h3>

                        <p>
                            Analyse relevant frames through the
                            AgroGuard-AI pest detection pipeline.
                        </p>

                    </article>


                    <article className="ag-workflow-card">

                        <div className="ag-step-top">
                            <span>03</span>
                            <span>ASSESS</span>
                        </div>

                        <div className="ag-step-icon">
                            ◇
                        </div>

                        <h3>
                            Risk Assessment
                        </h3>

                        <p>
                            Translate detections into field-level
                            severity and spatial risk information.
                        </p>

                    </article>

                </div>


                <button
                    className="ag-text-link"
                    onClick={() => navigate("/workflow")}
                >
                    View complete workflow
                    <span>→</span>
                </button>

            </section>



            {/* =====================================================
                SOLUTIONS PREVIEW
            ===================================================== */}

            <section className="ag-section ag-solutions">

                <div className="ag-section-number">
                    02
                </div>


                <div className="ag-solutions-heading">

                    <div className="ag-label">
                        AGROGUARD SOLUTIONS
                    </div>

                    <h2>
                        One platform.
                        <br />
                        <em>A complete workflow.</em>
                    </h2>

                    <p>
                        Designed to connect the technical side of
                        agricultural monitoring with a farmer-friendly
                        experience.
                    </p>

                </div>


                <div className="ag-solutions-grid">

                    <article>
                        <span>01</span>
                        <h3>Farm Management</h3>
                        <p>
                            Maintain farmer, farm and crop information
                            for mission-based monitoring.
                        </p>
                        <div>↗</div>
                    </article>


                    <article>
                        <span>02</span>
                        <h3>Pest Detection</h3>
                        <p>
                            Identify agricultural threats from
                            analysed UAV imagery.
                        </p>
                        <div>↗</div>
                    </article>


                    <article>
                        <span>03</span>
                        <h3>Spatial Risk Zones</h3>
                        <p>
                            Understand where detected threats are
                            concentrated across the field.
                        </p>
                        <div>↗</div>
                    </article>


                    <article>
                        <span>04</span>
                        <h3>Severity Assessment</h3>
                        <p>
                            Convert detection information into a
                            clear field-risk assessment.
                        </p>
                        <div>↗</div>
                    </article>


                    <article>
                        <span>05</span>
                        <h3>Spray Advisory</h3>
                        <p>
                            Provide responsible decision-support
                            information for crop protection.
                        </p>
                        <div>↗</div>
                    </article>


                    <article>
                        <span>06</span>
                        <h3>Mission Reporting</h3>
                        <p>
                            Generate structured records of analysed
                            missions and their findings.
                        </p>
                        <div>↗</div>
                    </article>

                </div>


                <button
                    className="ag-text-link"
                    onClick={() => navigate("/solutions")}
                >
                    Explore all solutions
                    <span>→</span>
                </button>

            </section>



            {/* =====================================================
                FARMER CTA
            ===================================================== */}

            <section className="ag-farmer">

                <div className="ag-farmer-image" />

                <div className="ag-farmer-shade" />


                <div className="ag-farmer-content">

                    <div className="ag-label ag-label-light">
                        BUILT AROUND THE FARMER
                    </div>


                    <h2>
                        Technology should
                        <br />
                        <em>serve the field.</em>
                    </h2>


                    <p>
                        Behind the AI, drone and data systems is a simple
                        goal: make agricultural information easier to
                        understand and act upon.
                    </p>


                    <div className="ag-farmer-points">

                        <div>
                            <strong>01</strong>
                            <span>Simple farmer onboarding</span>
                        </div>

                        <div>
                            <strong>02</strong>
                            <span>Mission-based monitoring</span>
                        </div>

                        <div>
                            <strong>03</strong>
                            <span>Understandable AI results</span>
                        </div>

                        <div>
                            <strong>04</strong>
                            <span>Local-language support</span>
                        </div>

                    </div>


                    <button
                        className="ag-btn ag-btn-primary"
                        onClick={() => navigate("/farmers")}
                    >
                        Explore Farmer Experience
                        <span>→</span>
                    </button>

                </div>

            </section>



            {/* =====================================================
                SPECIALIST PREVIEW
            ===================================================== */}

            <section className="ag-section ag-specialists">

                <div className="ag-specialist-copy">

                    <div className="ag-label">
                        AGRICULTURAL SPECIALIST NETWORK
                    </div>


                    <h2>
                        When technology
                        <br />
                        isn't enough,
                        <br />
                        <em>connect with expertise.</em>
                    </h2>


                    <p>
                        AgroGuard-AI can help farmers discover
                        agricultural specialists near their location
                        when additional field-level guidance is needed.
                    </p>


                    <button
                        className="ag-text-link"
                        onClick={() => navigate("/specialists")}
                    >
                        Explore specialist support
                        <span>→</span>
                    </button>

                </div>


                <div className="ag-specialist-visual">

                    <div className="ag-map-grid" />

                    <div className="ag-map-ring ag-map-ring-one" />

                    <div className="ag-map-ring ag-map-ring-two" />

                    <div className="ag-map-pin">
                        <span />
                    </div>


                    <div className="ag-location-card">

                        <span>
                            AGROGUARD NETWORK
                        </span>

                        <strong>
                            Nearby agricultural support
                        </strong>

                        <small>
                            Location-based specialist discovery
                        </small>

                    </div>

                </div>

            </section>



            {/* =====================================================
                LANGUAGE
            ===================================================== */}

            <section className="ag-language">

                <div className="ag-language-inner">

                    <div className="ag-label ag-label-light">
                        DESIGNED FOR INDIA
                    </div>


                    <h2>
                        Your farm.
                        <br />
                        Your language.
                        <br />
                        <em>Your information.</em>
                    </h2>


                    <div className="ag-language-list">

                        <div>
                            <span>01</span>
                            <strong>English</strong>
                        </div>

                        <div>
                            <span>02</span>
                            <strong>हिन्दी</strong>
                        </div>

                        <div>
                            <span>03</span>
                            <strong>ಕನ್ನಡ</strong>
                        </div>

                    </div>

                </div>

            </section>



            {/* =====================================================
                FINAL CTA
            ===================================================== */}

            <section className="ag-final">

                <div className="ag-final-orbit" />


                <div className="ag-label">
                    BEGIN WITH AGROGUARD-AI
                </div>


                <h2>
                    See your field
                    <br />
                    <em>with new eyes.</em>
                </h2>


                <p>
                    Bring aerial intelligence and agricultural
                    decision support together in one platform.
                </p>


                <div className="ag-hero-actions">

                    <button
                        className="ag-btn ag-btn-primary"
                        onClick={() => navigate("/portal")}
                    >
                        Enter Farmer Portal
                        <span>→</span>
                    </button>


                    <button
                        className="ag-btn ag-btn-outline"
                        onClick={() => navigate("/about")}
                    >
                        Learn About AgroGuard
                    </button>

                </div>

            </section>

        </div>
    );
}

export default Home;