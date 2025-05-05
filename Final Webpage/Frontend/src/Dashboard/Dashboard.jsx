import { useState } from "react";
import "./Dashboard.css";
import { FaHome, FaBullseye, FaChartPie, FaHistory, FaRobot, FaUpload, FaComments, FaSignOutAlt } from "react-icons/fa";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = () => {
    alert("Fișierul și opțiunea au fost trimise!");
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <h2 className="logo">BANK <span>of Young Programmers</span></h2>
        <nav className="nav">
          <a href="#"><FaHome style={{ marginRight: '8px' }} />Dashboard</a>
          <a href="#"><FaChartPie style={{ marginRight: '8px' }} />Analytics</a>
          <a href="#"><FaBullseye style={{ marginRight: '8px' }} />Goals</a>
          <a href="#"><FaHistory style={{ marginRight: '8px' }} />History</a>
          <a href="#" className="active"><FaComments style={{ marginRight: '8px' }} />AI Assistant</a>
        </nav>
        <button className="logout"><FaSignOutAlt style={{ marginRight: '8px' }} />Log Out</button>
      </aside>

      <main className="main">
        <h1>AI Banking Assistant</h1>

        <div className="upload-section">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="file-input"
            accept=".pdf,.doc,.docx"
          />
        </div>

        <select
          value={selectedOption}
          onChange={handleOptionChange}
          className="dropdown"
        >
          <option value="">Select an option</option>
          <option value="pie">Pie chart</option>
          <option value="bar">Bar chart</option>
          <option value="line">Line chart</option>
        </select>

        <button onClick={handleSubmit} className="submit-button">Send</button>

        {/* <div className="report-placeholder">
          <h3>Spendings:</h3>
          <img src="/placeholder-chart.png" alt="Placeholder report" />
        </div> */}
      </main>
    </div>
  );
}
