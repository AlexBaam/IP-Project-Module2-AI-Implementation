import { useState } from "react";
import "./Dashboard.css";
import { FaHome, FaBullseye, FaChartPie, FaHistory, FaRobot, FaUpload, FaComments, FaSignOutAlt } from "react-icons/fa";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [htmlContent, setHtmlContent] = useState(""); // State to store the HTML content

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedOption) {
      alert("Va rugam sa incarcati un fisier si sa selectati o optiune!");
      return;
    }

  const formData = new FormData();
    formData.append("files", selectedFile);
    formData.append("reportType", selectedOption);

    try {
      const response = await fetch("http://localhost:5000/generate-report", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const html = await response.text();
        setHtmlContent(html); // Store the HTML content
      } else {
        console.error("Error generating report");
      }
    } catch (error) {
      console.error("Error:", error);
    }
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

        {/* Render the generated HTML report */}
        {htmlContent && (
  <div className="report-section" style={{ width: "100%", height: "100%", overflow: "hidden" }}>
    <h2>Generated Report:</h2>
    <iframe
      srcDoc={htmlContent}
      title="Generated Report"
      style={{
        width: "100%",
        height: "100vh", // Full viewport height
        border: "none",
        overflow: "hidden",
      }}
    />
  </div>
)}
      </main>
    </div>
  );
}
