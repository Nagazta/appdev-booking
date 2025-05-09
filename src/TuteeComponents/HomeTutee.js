import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderTutee from './HeaderTutee';
import './CSS/HomeTutee.css';

function HomeTutee() {
  const [tutorBookings, setTutorBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  // Get studentId from localStorage
  const studentId = localStorage.getItem('student_id');

  // Fetch student name
  useEffect(() => {
    if (!studentId) return;

    fetch(`http://localhost:8080/student/getById/${studentId}`)
      .then(res => res.json())
      .then(data => {
        setStudentName(data.first_name);
      })
      .catch(err => console.error('Error fetching student name:', err));
  }, [studentId]);

  // Fetch all bookings and filter for the logged-in student
  useEffect(() => {
    if (!studentId) {
      console.error('No studentId found in localStorage');
      return;
    }

    fetch('http://localhost:8080/booking/all')
      .then(response => response.json())
      .then(data => {
        const studentBookings = data.filter(
          booking => booking.student?.student_id === parseInt(studentId)
        );

        const upcomingBookings = studentBookings
          .filter(booking => new Date(booking.sessionDateTime) >= new Date())
          .sort((a, b) => new Date(a.sessionDateTime) - new Date(b.sessionDateTime));

        setTutorBookings(upcomingBookings);
      })
      .catch(error => console.error('Error fetching bookings:', error));
  }, [studentId]);

  // Fetch announcements
  useEffect(() => {
    fetch('http://localhost:8080/announcement/getAllAnnounce')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAnnouncements(sorted.slice(0, 5)); // Limit to 5
      })
      .catch(err => console.error('Error fetching announcements:', err));
  }, []);

  const handleViewClick = () => {
    navigate('/tutee/my-bookings');
  };

  return (
    <div className="home-tutee-container">
      <HeaderTutee />

      <div className="welcome-container">
        <h1>Welcome back, {studentName}!</h1>
        <p>Work smart, not harder</p>
      </div>

      <div className="tutoring-title">
      <h2>Upcoming Tutoring Schedule</h2>

      </div>
  

    <div className="home-tutoring-schedule-container">
      <div className="tutoring-cards-wrapper">
        {tutorBookings.length > 0 ? (
          tutorBookings.map((booking) => (
            <div key={booking.booking_id} className="tutor-card">
              <div className="tutor-info">
                <span className="tutor-name">
                  {booking.tutor?.student?.first_name} {booking.tutor?.student?.last_name}
                </span>
                <span className="tutor-role">Tutor</span>
              </div>
              <div className="tutor-subject">Subject: {booking.subject}</div>
              <p><strong>Status:</strong> {booking.status || 'N/A'}</p>
              <div className="tutor-date">
                Date: {new Date(booking.sessionDateTime).toLocaleString()}
              </div>
              <button className="view-button" onClick={handleViewClick}>
                View
              </button>
            </div>
          ))
        ) : (
          <p>No upcoming bookings.</p>
        )}
      </div>

      <div className="tutee-announcement-container">
        <h3>Announcements</h3>
        <div className="announcement-list">
          {announcements.length > 0 ? (
            announcements.map((item) => (
              <div key={item.announcement_id} className="announcement-item">
                <p className="announcement-message">{item.message}</p>
                <p className="timestamp">
                  🕒 Posted on: {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="announcement-message">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>`
    </div>
  );
}

export default HomeTutee;