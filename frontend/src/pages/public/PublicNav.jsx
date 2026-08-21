import { Link, useLocation } from "react-router-dom";
import "./PublicPages.css";

function PublicNav() {
    const location = useLocation();

    const links = [
        { label: "Home", path: "/" },
        { label: "About", path: "/about" },
        { label: "Workflow", path: "/workflow" },
        { label: "Solutions", path: "/solutions" },
        { label: "Farmers", path: "/farmers" },
        { label: "Specialists", path: "/specialists" },
    ];

    return (
        <header className="ag-navbar">
            <div className="ag-nav-inner">

                <Link to="/" className="ag-brand">
                    <img
                        src="/branding/agrogard-logo.png"
                        alt="AgroGuard-AI"
                    />

                    <div className="ag-brand-copy">
                        <strong>AgroGuard</strong>
                        <span>AI</span>
                    </div>
                </Link>

                <nav className="ag-nav-links">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={
                                location.pathname === link.path
                                    ? "active"
                                    : ""
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <Link
                    to="/portal"
                    className="ag-nav-portal"
                >
                    Farmer Portal
                    <span>↗</span>
                </Link>

            </div>
        </header>
    );
}

export default PublicNav;