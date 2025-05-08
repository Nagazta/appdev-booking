import React, { useEffect, useState } from "react";
import HeaderTutor from "./HeaderTutor";
import "./CSS/HomeTutor.css";


function HomeTutor() {
  const [activeStudents, setActiveStudents] = useState(0);
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [tutorName, setTutorName] = useState("");


  useEffect(() => {
    fetch("http://localhost:8080/student/activeStudentsCount")
      .then((res) => res.json())
      .then((data) => setActiveStudents(data))
      .catch((error) => console.error("Error fetching students:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/announcement/activeAnnounce")
      .then((res) => res.json())
      .then((data) => setActiveAnnouncements(data))
      .catch((error) => console.error("Error fetching announcements:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/payment/totalCompletedPayments")
      .then((res) => res.json())
      .then((data) => {
        if (data !== null) setTotalPayments(data.toFixed(2));
      })
      .catch((error) => console.error("Error fetching total payments:", error));
  }, []);
  
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    setTutorName(storedName || "Tutor");
  }, []);

  useEffect(() => {
    const tutorId = localStorage.getItem("tutor_id"); // Ensure this is stored on login
  
    if (tutorId) {
      fetch(`http://localhost:8080/payment/totalCompletedPayments/${tutorId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data !== null) setTotalPayments(data.toFixed(2));
        })
        .catch((error) => console.error("Error fetching total payments:", error));
    }
  }, []);
  

  return (
    <div>
      <HeaderTutor />

      <div className="tutor-homepage-container">
        <div className="tutor-homepage-content">
          <div className="tutor-info">
          <h2>Welcome, {tutorName}!</h2>
            <p className="tutor-role">Tutor</p>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card maroon">
              <h3>Active Students</h3>
              <p>{activeStudents}</p>
            </div>
            <div className="stat-card maroon">
              <h3>Payments Total</h3>
              <p>₱{totalPayments}</p>
              </div>

          </div>

          <hr className="divider" />

          <div className="opening-hours-card">
            <h3>Opening Hours</h3>
            <p><span className="closed-day">Sun</span> Closed</p>
            <p>Mon 9:00 AM - 8:00 PM</p>
            <p>Tue 9:00 AM - 8:00 PM</p>
            <p>Wed 9:00 AM - 8:00 PM</p>
            <p>Thu 9:00 AM - 8:00 PM</p>
            <p>Fri 9:00 AM - 8:00 PM</p>
            <p><span className="closed-day">Sat</span> Closed</p>
          </div>

          <div className="announcements-card">
            <h3>Active Announcements</h3>
            {activeAnnouncements.length > 0 ? (
              <ul>
                {activeAnnouncements.map((announcement) => (
                  <li key={announcement.announcement_id}>
                    <p>{announcement.message}</p>
                    <small>Created at: {announcement.created_at}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active announcements.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeTutor;
