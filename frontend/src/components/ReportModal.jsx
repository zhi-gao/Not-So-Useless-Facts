import React, { useState } from "react";
import styles from "../components/ReportModal.module.css";

const ReportModal = ({ onClose }) => {
  const [reportReason, setReportReason] = useState(""); // State to manage selected report reason
  const [details, setDetails] = useState(""); // State to manage input details

  const handleReportSubmit = () => {
    // Handle submission logic here, you can send the report data to the server or perform other actions
    console.log("Report Reason:", reportReason);
    console.log("Details:", details);

    // Close the modal after submitting
    onClose();
  };

  return (
    <div className={styles.reportModal}>
      <h2>Flag this Fact as:</h2>
      <label>
        <input
          type="radio"
          name="reportReason"
          value="Misleading"
          checked={reportReason === "Misleading"}
          onChange={() => setReportReason("Misleading")}
        />
        Misleading
      </label>
      <label>
        <input
          type="radio"
          name="reportReason"
          value="Inaccurate"
          checked={reportReason === "Inaccurate"}
          onChange={() => setReportReason("Inaccurate")}
        />
        Inaccurate or has been proven false
      </label>
      <label>
        <input
          type="radio"
          name="reportReason"
          value="Other"
          checked={reportReason === "Other"}
          onChange={() => setReportReason("Other")}
        />
        Other
      </label>
      <textarea
        className={styles.textArea}
        placeholder="Add more details here..."
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      ></textarea>
      <div className={styles.buttonContainer}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleReportSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default ReportModal;