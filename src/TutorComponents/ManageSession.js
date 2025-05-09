import React, { useState, useEffect } from "react";
import HeaderTutor from "./HeaderTutor";
import "./CSS/ManageSession.css";

function ManageSession() {
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [updatedSubject, setUpdatedSubject] = useState("");
  const [updatedDateTime, setUpdatedDateTime] = useState("");
  const [updatedStatus, setUpdatedStatus] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [existingPaymentId, setExistingPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPayments, setAllPayments] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    const tutorId = localStorage.getItem("tutor_id");
    
    if (!tutorId) {
      console.error("❌ Tutor ID not found in localStorage.");
      setIsLoading(false);
      setError("Tutor ID not found. Please login again.");
      return;
    }

    try {
      console.log("📡 Fetching sessions from backend...");
      const sessionRes = await fetch("http://localhost:8080/booking/all");
      
      if (!sessionRes.ok) {
        throw new Error(`Failed to fetch sessions: ${sessionRes.status}`);
      }
      
      const sessionsData = await sessionRes.json();
      console.log("✅ Raw sessions received:", sessionsData);

      const filteredSessions = sessionsData.filter(
        (session) => session.tutor && String(session.tutor.tutor_id) === String(tutorId)
      );
      console.log("✅ Filtered sessions for tutor:", filteredSessions);

      console.log("📡 Fetching payments data...");
      const paymentRes = await fetch("http://localhost:8080/payment/getAllPayments");
      
      if (!paymentRes.ok) {
        throw new Error(`Failed to fetch payments: ${paymentRes.status}`);
      }
      
      const paymentsData = await paymentRes.json();
      console.log("✅ Payments data received:", paymentsData);
      
      // Store all payments for later use
      setAllPayments(paymentsData);

      // Map payments to sessions
      const sessionsWithPayment = filteredSessions.map((session) => {
        const payment = paymentsData.find(
          (p) => p.booking && p.booking.bookingId === session.bookingId
        );
        
        return {
          ...session,
          payment: payment || null,
          paymentStatus: payment ? payment.status : "No Payment",
          paymentAmount: payment ? payment.amount : 0
        };
      });

      setSessions(sessionsWithPayment);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Failed to load sessions. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setUpdatedSubject(session.subject);
    
    // Format the date for datetime-local input
    const date = new Date(session.sessionDateTime);
    const formattedDate = date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
    setUpdatedDateTime(formattedDate);
    
    setUpdatedStatus(session.status);
  };

  const handleSave = (bookingId) => {
    const originalSession = sessions.find((s) => s.bookingId === bookingId);
    
    if (!originalSession) {
      console.error("Cannot find original session to update");
      return;
    }

    // Create a complete updated session object that preserves all original data
    const updatedSession = {
      ...originalSession,
      subject: updatedSubject,
      sessionDateTime: updatedDateTime,
      status: updatedStatus
    };

    console.log("Sending updated session:", updatedSession);

    fetch(`http://localhost:8080/booking/update/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSession),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update session");
        return response.json();
      })
      .then((data) => {
        console.log("✅ Session updated successfully:", data);
        setEditingSession(null);
        fetchSessions();
      })
      .catch((error) => {
        console.error("❌ Error updating session:", error);
        alert("Failed to update session. Please try again.");
      });
  };

const handleDelete = (bookingId) => {
  if (window.confirm("Are you sure you want to delete this session?")) {
    // Find the session in your state
    const sessionToDelete = sessions.find(s => s.bookingId === bookingId);
    
    if (sessionToDelete && sessionToDelete.payment) {
      // The session has a payment association
      console.log("Session has payment association:", sessionToDelete.payment);
      
      // Try to find the payment ID from the allPayments array which might have the full data
      const paymentDetails = allPayments.find(
        p => p.booking && p.booking.bookingId === bookingId
      );
      
      const paymentId = paymentDetails ? paymentDetails.payment_id : null;
      
      if (paymentId) {
        console.log(`Found payment ID ${paymentId} from allPayments, deleting payment first...`);
        
        // Delete payment first
        fetch(`http://localhost:8080/payment/delete/${paymentId}`, { method: "DELETE" })
          .then((res) => {
            if (!res.ok) {
              console.error(`Payment deletion failed with status: ${res.status}`);
              throw new Error(`Failed to delete payment. Status: ${res.status}`);
            }
            return res.text();
          })
          .then(() => {
            console.log("✅ Payment deleted successfully, now deleting session...");
            return fetch(`http://localhost:8080/booking/delete/${bookingId}`, { method: "DELETE" });
          })
          .then((res) => {
            if (!res.ok) {
              console.error(`Session deletion failed with status: ${res.status}`);
              throw new Error("Failed to delete session.");
            }
            return res.text();
          })
          .then(() => {
            console.log("✅ Session deleted successfully.");
            fetchSessions(); // Refresh list
          })
          .catch((err) => {
            console.error("❌ Error during deletion:", err);
            alert(`Deletion failed: ${err.message}`);
          });
      } else {
        // We need to handle this case - we know there's a payment but can't find the ID
        console.error("Session has payment but no ID could be found");
        alert("Cannot delete this session - it has a payment record but the payment ID cannot be determined. Please contact your administrator.");
      }
    } else {
      // No payment → can delete session directly
      fetch(`http://localhost:8080/booking/delete/${bookingId}`, { method: "DELETE" })
        .then((res) => {
          if (!res.ok) {
            console.error(`Session deletion failed with status: ${res.status}`);
            throw new Error("Failed to delete session.");
          }
          return res.text();
        })
        .then(() => {
          console.log("✅ Session deleted successfully.");
          fetchSessions();
        })
        .catch((err) => {
          console.error("❌ Error deleting session:", err);
          alert(`Failed to delete session: ${err.message}`);
        });
    }
  }
};

  const handleCancelEdit = () => {
    setEditingSession(null);
  };

 const handleOpenPayment = (session) => {
  console.log("Opening payment modal for session:", session);
  setSelectedPayment(session);
  
  const paymentsForBooking = allPayments.filter(
    (p) => p.booking && p.booking.bookingId === session.bookingId // 🟢 FIX HERE
  );

  const existingPayment = paymentsForBooking.find(p => p.status !== "Completed") || paymentsForBooking[0];

  if (existingPayment) {
    console.log("Existing payment found for this booking:", existingPayment);
    setPaymentStatus(existingPayment.status);
    setPaymentAmount(existingPayment.amount.toString());
    setExistingPaymentId(existingPayment.payment_id);
  } else {
    setPaymentStatus("");
    setPaymentAmount("");
    setExistingPaymentId(null);
  }

  setShowPaymentModal(true);
};


  const handleSavePayment = () => {
    if (!paymentStatus) {
      alert("Please select a payment status");
      return;
    }
  
    // Only validate amount for Completed status
    if (paymentStatus === "Completed") {
      const amount = parseFloat(paymentAmount);
      if (!paymentAmount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid payment amount for completed payments");
        return;
      }
    }
  
    const amount = paymentStatus === "Completed"
      ? parseFloat(paymentAmount)
      : 0; // Use 0 for Pending or Failed
  
    // ✅❗️👉 USE `existingPaymentId` INSTEAD
    if (existingPaymentId) {
      const url = `http://localhost:8080/payment/updatePayment/${existingPaymentId}`;
  
      const payload = {
        payment_id: existingPaymentId,
        booking: { bookingId: selectedPayment.bookingId },
        status: paymentStatus,
        amount: amount
      };
  
      console.log("Updating existing payment:", payload);
  
      fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update payment");
          return response.text().then((text) => {
            try {
              return JSON.parse(text);
            } catch (e) {
              return { successMessage: text };
            }
          });
        })
        .then((data) => {
          console.log("✅ Payment updated successfully:", data);
          setShowPaymentModal(false);
          fetchSessions();
        })
        .catch((error) => {
          console.error("❌ Error updating payment:", error);
          alert("Failed to update payment. Please try again.");
        });
  
    } else {
      // No existing payment → create new
      const url = "http://localhost:8080/payment/addPayment";
  
      const payload = {
        booking: { bookingId: selectedPayment.bookingId },
        status: paymentStatus,
        amount: amount
      };
  
      console.log("Creating new payment:", payload);
  
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to create payment");
          return response.text().then((text) => {
            try {
              return JSON.parse(text);
            } catch (e) {
              return { successMessage: text };
            }
          });
        })
        .then((data) => {
          console.log("✅ Payment created successfully:", data);
          setShowPaymentModal(false);
          fetchSessions();
        })
        .catch((error) => {
          console.error("❌ Error creating payment:", error);
          alert("Failed to create payment. Please try again.");
        });
    }
  };
  
  

  if (error) {
    return (
      <div>
        <HeaderTutor />
        <div className="manage-session-container">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchSessions}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeaderTutor />
      <div className="manage-session-container">
        <div className="manage-session-content">
          <h2 className="manage-title">Manage Sessions</h2>
          
          {isLoading ? (
            <div className="loading">Loading sessions...</div>
          ) : (
            <div className="session-cards">
              {sessions.length > 0 ? (
                sessions.map((session) => {
                  const isEditing = editingSession?.bookingId === session.bookingId;

                  return (
                    <div key={session.bookingId} className="session-card">
                      <p>
                        <strong>Subject:</strong>{" "}
                        {isEditing ? (
                          <input
                            type="text"
                            value={updatedSubject}
                            onChange={(e) => setUpdatedSubject(e.target.value)}
                          />
                        ) : (
                          session.subject
                        )}
                      </p>
                      <p>
                        <strong>Date & Time:</strong>{" "}
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={updatedDateTime}
                            onChange={(e) => setUpdatedDateTime(e.target.value)}
                          />
                        ) : (
                          new Date(session.sessionDateTime).toLocaleString()
                        )}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {isEditing ? (
                          <select
                            value={updatedStatus}
                            onChange={(e) => setUpdatedStatus(e.target.value)}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          session.status
                        )}
                      </p>
                      <p>
                        <strong>Tutee:</strong> {session.student.first_name}{" "}
                        {session.student.last_name}
                      </p>
                      <p className={`payment-status ${session.paymentStatus.toLowerCase().replace(' ', '-')}`}>
                        <strong>Payment:</strong>{" "}
                        {session.paymentStatus === "No Payment" ? (
                          "No Payment"
                        ) : (
                          <>
                            {session.paymentStatus} (₱{session.paymentAmount})
                          </>
                        )}
                      </p>
                      <div className="card-btn-group">
                        {isEditing ? (
                          <>
                            <button className="card-btn btn-save" onClick={() => handleSave(session.bookingId)}>
                              Save
                            </button>
                            <button className="card-btn btn-cancel" onClick={handleCancelEdit}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="card-btn btn-edit" onClick={() => handleEdit(session)}>
                              Edit
                            </button>
                            <button className="card-btn btn-cancel" onClick={() => handleDelete(session.bookingId)}>
                              Delete
                            </button>
                            <button 
                              className="card-btn btn-payment" 
                              onClick={() => handleOpenPayment(session)}
                            >
                              {session.payment ? "Update Payment" : "Add Payment"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No sessions available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <h3>
              {existingPaymentId ? "Update Payment" : "Add Payment"} for{" "}
              {selectedPayment?.student.first_name} {selectedPayment?.student.last_name}
            </h3>
            <div className="payment-form">
              <div className="form-group">
                <label>Session Date:</label>
                <div className="form-value">
                  {new Date(selectedPayment?.sessionDateTime).toLocaleString()}
                </div>
              </div>
              
              <div className="form-group">
                <label>Status:</label>
                <select 
                  value={paymentStatus} 
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="payment-input"
                >
                  <option value="">Select status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              {/* Only show amount field when status is "Completed" */}
              {paymentStatus === "Completed" && (
                <div className="form-group">
                  <label>Amount (₱):</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="payment-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
            
            <div className="modal-buttons">
              <button className="btn-save" onClick={handleSavePayment}>
                {existingPaymentId ? "Update Payment" : "Save Payment"}
              </button>
              <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSession;