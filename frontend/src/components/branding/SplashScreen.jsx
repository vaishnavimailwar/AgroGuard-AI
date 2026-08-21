import { useEffect, useState } from "react";
import "./SplashScreen.css";

function SplashScreen({ duration = 3000, onComplete }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const start = Date.now();

        const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const percentage = Math.min(
                (elapsed / duration) * 100,
                100
            );

            setProgress(percentage);

            if (elapsed >= duration) {
                clearInterval(timer);
                onComplete?.();
            }
        }, 30);

        return () => clearInterval(timer);
    }, [duration, onComplete]);

    return (
        <div
            className="ag-splash"
            role="status"
            aria-label="Loading AgroGuard-AI"
        >
            <div className="ag-splash-glow ag-splash-glow-one" />
            <div className="ag-splash-glow ag-splash-glow-two" />

            <div className="ag-splash-content">
                <div className="ag-splash-logo-wrap">
                    <img
                        src="/branding/agrogard-logo.png"
                        alt="AgroGuard-AI"
                        className="ag-splash-logo"
                    />
                </div>

                <p className="ag-splash-tagline">
                    Intelligent Crop Protection
                </p>

                <div className="ag-splash-loader">
                    <div
                        className="ag-splash-loader-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="ag-splash-status">
                    Initializing AgroGuard-AI
                </p>
            </div>
        </div>
    );
}

export default SplashScreen;
