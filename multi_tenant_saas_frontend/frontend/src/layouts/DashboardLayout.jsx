import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import "./DashboardLayout.css";

function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">

            <Navbar />

            <div className="dashboard-body">

                <Sidebar />

                <main className="dashboard-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;