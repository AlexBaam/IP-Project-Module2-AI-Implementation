import { useState } from "react";
import "./Dashboard.css";
//import { FaHome, FaBullseye, FaChartPie, FaHistory, FaRobot, FaUpload, FaComments, FaSignOutAlt } from "react-icons/fa";
import { LayoutGrid, Target, BarChart2, Clock, Bot, Upload, MessageCircle, LogOut } from "lucide-react";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [htmlContent, setHtmlContent] = useState(""); // State to store the HTML content

  const [activeItem, setActiveItem] = useState("dashboard");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "goals", label: "Goals", icon: Target },
    { id: "history", label: "History", icon: Clock },
    { id: "ai", label: "AI Assistant", icon: Bot },
  ];

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

   const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-wrapper">
      <div 
        className={`hamburger-menu ${isSidebarOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </div>

      {/* Overlay */}
      <div 
        className={`overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      ></div>

      
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}> 
         <div className="w-[228px] flex flex-col">
          <div className="p-6 flex flex-col">
            <div className="text-white text-2xl font-bold">BANK</div>
            <div className="text-white text-xs opacity-80">
              of Young Programmers
            </div>
          </div>
        </div>
        <nav className="nav">
          <a href="#"><LayoutGrid style={{ width: '20px', height: '20px' }} />Dashboard</a>
          <a href="#"><BarChart2 style={{ width: '20px', height: '20px' }} />Analytics</a>
          <a href="#"><Target style={{ width: '20px', height: '20px' }} />Goals</a>
          <a href="#"><Clock style={{ width: '20px', height: '20px' }} />History</a>
          <a href="#" className="active"><Bot style={{ width: '20px', height: '20px' }} />AI Assistant</a>
        </nav>
        <div className="mb-6 px-6">
          <button className="flex items-center gap-3 px-6 py-3 text-white"><LogOut style={{ width: '20px', height: '20px' }} />Log Out</button>
        </div>
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
