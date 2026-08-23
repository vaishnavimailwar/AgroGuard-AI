import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./pages/public/PublicLayout.jsx";

import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Workflow from "./pages/public/Workflow.jsx";
import Solutions from "./pages/public/Solutions.jsx";
import Farmers from "./pages/public/Farmers.jsx";
import Specialists from "./pages/public/Specialists.jsx";

import Portal from "./pages/portal/Portal.jsx";
import Login from "./pages/portal/Login.jsx";
import Signup from "./pages/portal/Signup.jsx";
import AgroGuardDashboard from "./pages/portal/AgroGuardDashboard.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminFarmers from "./pages/admin/AdminFarmers.jsx";
import AdminMissions from "./pages/admin/AdminMissions.jsx";
import AdminAIResults from "./pages/admin/AdminAIResults.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* PUBLIC WEBSITE */}
                <Route element={<PublicLayout />}>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/about"
                        element={<About />}
                    />

                    <Route
                        path="/workflow"
                        element={<Workflow />}
                    />

                    <Route
                        path="/solutions"
                        element={<Solutions />}
                    />

                    <Route
                        path="/farmers"
                        element={<Farmers />}
                    />

                    <Route
                        path="/specialists"
                        element={<Specialists />}
                    />

                </Route>


                {/* AGROGUARD APPLICATION */}
                <Route
                    path="/portal"
                    element={<Portal />}
                />
<Route
    path="/login"
    element={<Login />}
/>

<Route
    path="/signup"
    element={<Signup />}
/>

<Route
    path="/dashboard"
    element={<AgroGuardDashboard />}
/>
<Route
    path="/admin/login"
    element={<AdminLogin />}
/>
<Route
    path="/admin"
    element={<AdminDashboard />}
/>
<Route
    path="/admin/farmers"
    element={<AdminFarmers />}
/>
<Route
    path="/admin/missions"
    element={<AdminMissions />}
/>

<Route
    path="/admin/ai-results"
    element={<AdminAIResults />}
/>

            </Routes>
        </BrowserRouter>
    );
}

export default App;