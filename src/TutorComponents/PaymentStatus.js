import React, { useState, useEffect } from "react";

const PaymentStatusDialog = ({ bookingId, onClose }) => {
  const [payment, setPayment] = useState(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (bookingId) {
      fetch(`http://localhost:8080/payment/getAllPayments`)
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((p) => p.booking_id === bookingId);
          if (found) {
            setPayment(found);
            setAmount(found.amount);
            setStatus(found.status_);
          }
        });
    }
  }, [bookingId]);

  const handleSubmit = () => {
    const payload = {
      amount,
      status_: status,
      booking_id: bookingId
    };

    fetch("http://localhost:8080/payment/addPayment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save payment");
        return res.text();
      })
      .then((text) => {
        alert("💰 Payment info saved!");
        onClose();
      })
      .catch((err) => {
        console.error("Error saving payment:", err);
        alert("❌ Failed to save payment.");
      });
  };

  return (
    <div className="payment-dialog">
      <h3>Payment Details for Booking #{bookingId}</h3>
      <label>
        Amount:
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label>
        Status:
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Declined">Declined</option>
        </select>
      </label>
      <div className="btn-group">
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PaymentStatusDialog;
