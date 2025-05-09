import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import HeaderAdmin from "./HeaderAdmin";
import "./CSS/SessionManagement.css";

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch("http://localhost:8080/booking/all")
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched session data:", data); // <-- ADD THIS LINE
      setSessions(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching sessions:", error);
      setLoading(false);
    });
}, []);


  const countByStatus = (status) =>
    sessions.filter((session) => session.status === status).length;

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content-area">
        <HeaderAdmin />
        <div className="session-container">
          <h2>Session Management</h2>
        </div>

        <div className="status-cards">
          <div className="card-yellow">
            <h3>{countByStatus("Scheduled")}</h3>
            <p>Active Sessions</p>
          </div>
          <div className="card-yellow">
            <h3>{countByStatus("Pending")}</h3>
            <p>Pending Sessions</p>
          </div>
          <div className="card-yellow">
            <h3>{countByStatus("Cancelled")}</h3>
            <p>Cancelled Sessions</p>
          </div>
        </div>

        <div className="session-filters">
          <button className="btn-see">See All</button>
          <button className="btn-date-range">
            Date: Mar 29 - April 1, 2025
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <p>Loading sessions...</p>
          ) : (
            <table className="session-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Student Name</th>
                  <th>Tutor Name</th>
                  <th>Subject</th>
                  <th>Session Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
             <tbody>
              {sessions.map((session) => (
                <tr key={session.bookingId}>
                  <td>{session.bookingId}</td>
                  <td>{`${session.student.first_name} ${session.student.last_name}`}</td>
                  <td>{`${session.tutor.student.first_name} ${session.tutor.student.last_name}`}</td>
                  <td>{session.subject}</td>
                  <td>{new Date(session.sessionDateTime).toLocaleString()}</td>
                  <td className={`status ${session.status.toLowerCase()}`}>
                    {session.status}
                  </td>
                  <td className="action-icons">
                    <span className="accept">✔️</span>
                    <span className="decline">❌</span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
