import "./Home.css";

function Home({ onEnterPortal }) {
    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <div className="ag-home">

            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <header className="ag-navbar">

                <div className="ag-nav-inner">

                    <button
                        className="ag-brand"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        aria-label="AgroGuard-AI home"
                    >
                        <img
                            src="/branding/agrogard-logo.png"
                            alt="AgroGuard-AI"
                        />

                        <div className="ag-brand-copy">
                            <strong>AgroGuard</strong>
                            <span>AI</span>
                        </div>
                    </button>


                    <nav className="ag-nav-links">

                        <button onClick={() => scrollToSection("ag-about")}>
                            About
                        </button>

                        <button onClick={() => scrollToSection("ag-workflow")}>
                            How It Works
                        </button>

                        <button onClick={() => scrollToSection("ag-services")}>
                            Solutions
                        </button>

                        <button onClick={() => scrollToSection("ag-farmer")}>
                            For Farmers
                        </button>

                        <button onClick={() => scrollToSection("ag-specialists")}>
                            Specialists
                        </button>

                    </nav>


                    <button
                        className="ag-nav-portal"
                        onClick={onEnterPortal}
                    >
                        Enter Portal
                        <span>↗</span>
                    </button>

                </div>

            </header>


            {/* =====================================================
                HERO
            ===================================================== */}

            <main>

                <section className="ag-hero">

                    <div className="ag-hero-image" />

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
                                onClick={onEnterPortal}
                            >
                                Enter Farmer Portal
                                <span>→</span>
                            </button>

                            <button
                                className="ag-btn ag-btn-ghost"
                                onClick={() => scrollToSection("ag-workflow")}
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

                        <span>AGROGUARD-AI</span>

                        <span className="ag-hero-bottom-line" />

                        <span>UAV · AI · AGRICULTURE</span>

                    </div>

                </section>


                {/* =================================================
                    TRUST STRIP
                ================================================= */}

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


                {/* =================================================
                    ABOUT
                ================================================= */}

                <section
                    id="ag-about"
                    className="ag-about ag-section"
                >

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
                                onClick={() => scrollToSection("ag-workflow")}
                            >
                                Explore the AgroGuard workflow
                                <span>→</span>
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    WORKFLOW
                ================================================= */}

                <section
                    id="ag-workflow"
                    className="ag-workflow ag-section"
                >

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
                                ◌
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
                                AgroGuard AI pest-detection pipeline.
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


                        <article className="ag-workflow-card">

                            <div className="ag-step-top">
                                <span>04</span>
                                <span>ADVISE</span>
                            </div>

                            <div className="ag-step-icon">
                                +
                            </div>

                            <h3>
                                Spray Advisory
                            </h3>

                            <p>
                                Present crop-protection decision support
                                based on the identified agricultural threat.
                            </p>

                        </article>


                        <article className="ag-workflow-card">

                            <div className="ag-step-top">
                                <span>05</span>
                                <span>CONNECT</span>
                            </div>

                            <div className="ag-step-icon">
                                ◎
                            </div>

                            <h3>
                                Specialist Support
                            </h3>

                            <p>
                                Help farmers discover nearby agricultural
                                specialists when additional support is needed.
                            </p>

                        </article>


                        <article className="ag-workflow-card">

                            <div className="ag-step-top">
                                <span>06</span>
                                <span>REPORT</span>
                            </div>

                            <div className="ag-step-icon">
                                ≡
                            </div>

                            <h3>
                                Mission Reports
                            </h3>

                            <p>
                                Keep a structured record of analysed missions,
                                findings and agricultural recommendations.
                            </p>

                        </article>

                    </div>

                </section>


                {/* =================================================
                    SOLUTIONS
                ================================================= */}

                <section
                    id="ag-services"
                    className="ag-solutions ag-section"
                >

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

                </section>


                {/* =================================================
                    FARMER
                ================================================= */}

                <section
                    id="ag-farmer"
                    className="ag-farmer"
                >

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
                            onClick={onEnterPortal}
                        >
                            Start with AgroGuard
                            <span>→</span>
                        </button>

                    </div>

                </section>


                {/* =================================================
                    SPECIALISTS
                ================================================= */}

                <section
                    id="ag-specialists"
                    className="ag-specialists ag-section"
                >

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
                            onClick={onEnterPortal}
                        >
                            Explore the farmer portal
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


                {/* =================================================
                    LANGUAGE
                ================================================= */}

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


                {/* =================================================
                    FINAL CTA
                ================================================= */}

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
                            onClick={onEnterPortal}
                        >
                            Enter Farmer Portal
                            <span>→</span>
                        </button>

                        <button
                            className="ag-btn ag-btn-outline"
                            onClick={() => scrollToSection("ag-about")}
                        >
                            Learn About AgroGuard
                        </button>

                    </div>

                </section>

            </main>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="ag-footer">

                <div className="ag-footer-top">

                    <div className="ag-footer-brand">

                        <img
                            src="/branding/agrogard-logo.png"
                            alt=""
                        />

                        <div>
                            <strong>AgroGuard-AI</strong>
                            <span>
                                UAV-Based Smart Agriculture System
                            </span>
                        </div>

                    </div>


                    <button
                        className="ag-footer-portal"
                        onClick={onEnterPortal}
                    >
                        Enter Portal
                        <span>↗</span>
                    </button>

                </div>


                <div className="ag-footer-bottom">

                    <span>
                        © 2026 AgroGuard-AI
                    </span>

                    <span>
                        AI · UAV · SMART AGRICULTURE
                    </span>

                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        Back to top ↑
                    </button>

                </div>

            </footer>

        </div>
    );
}

export default Home;