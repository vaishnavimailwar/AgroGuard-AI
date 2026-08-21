import { Outlet } from "react-router-dom";
import PublicNav from "./PublicNav";
import "./PublicPages.css";

function PublicLayout() {
    return (
        <div className="public-page">

            <PublicNav />

            <main>
                <Outlet />
            </main>

            <footer className="ag-footer">

                <div className="ag-footer-top">

                    <div className="ag-footer-brand">

                        <img
                            src="/branding/agrogard-logo.png"
                            alt="AgroGuard-AI"
                        />

                        <div>
                            <strong>AgroGuard-AI</strong>

                            <span>
                                AI · UAV · SMART AGRICULTURE
                            </span>
                        </div>

                    </div>

                    <a
                        href="#top"
                        className="ag-footer-portal"
                    >
                        Back to top ↑
                    </a>

                </div>

                <div className="ag-footer-bottom">

                    <span>
                        © 2026 AgroGuard-AI
                    </span>

                    <span>
                        Intelligent agriculture. Actionable intelligence.
                    </span>

                </div>

            </footer>

        </div>
    );
}

export default PublicLayout;