import React from "react";
import Sidebar from "./Sidebar";
import HeaderAdmin from "./HeaderAdmin";  // Assuming you have a header component
import "./CSS/HomePage.css";  // Assuming you're using the correct CSS file

function HomePage() {
  return (
    <div>
      <HeaderAdmin />
      <Sidebar />

      <div className="homepage-content">
        <h1 className="welcome-message">Welcome, Admin!</h1>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>1,245</p>
          </div>
          <div className="stat-card">
            <h3>Total Announcements</h3>
            <p>30</p>
          </div>
          <div className="stat-card">
            <h3>Total Sessions</h3>
            <p>7</p>
          </div>
        </div>

        <div className="quick-links">
          <h2>Quick Actions</h2>
          <ul>
            <li><a href="/admin/user-manage">Manage Users</a></li>
            <li><a href="/admin/session-manage">Manage Sessions</a></li>
            <li><a href="/admin/announcements">View Announcements</a></li>
            <li><a href="/admin/settings">Settings</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
