import { useState } from "react";
import "./Dashboard.css";
//import { FaHome, FaBullseye, FaChartPie, FaHistory, FaRobot, FaUpload, FaComments, FaSignOutAlt } from "react-icons/fa";
import { LayoutGrid, Target, BarChart2, Clock, Bot, Upload, MessageCircle, LogOut } from "lucide-react";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [htmlContent, setHtmlContent] = useState(""); // State to store the HTML content

  const [activeItem, setActiveItem] = useState("dashboard");

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

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar"> 
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

      {/* <div className="border-r h-screen flex flex-col">
      <div className="bg-[#8BC29B] flex-1 flex flex-col">
        <div className="px-4 py-4">
          <div className="flex flex-col">
            <h2 className="text-4xl font-bold text-white">BANK</h2>
            <div className="text-sm text-white/80 leading-tight">
              of Young
              <br />
              Programmers
            </div>
          </div>
        </div>
        <div className="px-2 py-2 space-y-1">
          <div className="px-2 py-2 space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`flex items-center gap-3 text-white hover:bg-white/20 hover:text-white rounded-md py-2 px-2 w-full text-left ${
                    activeItem === item.id ? "bg-white/20 font-medium" : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto px-2 py-2">
          <button
            className="flex items-center gap-3 text-white hover:bg-white/20 hover:text-white rounded-md py-2 px-2 w-full text-left"
            onClick={() => console.log("Log out clicked")}
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div> */}
  

     {/* <div className="sidebar-wrapper">
    <div className="sidebar-content">
      <div className="sidebar-header">
        <h2 className="logo-title">BANK</h2>
        <div className="logo-subtitle">
          of Young <br />
          Programmers
        </div>
      </div>

      <div className="menu-items">
        <button className="menu-button active">
          <LayoutDashboard className="menu-icon" />
          <span>Dashboard</span>
        </button>
        <button className="menu-button">
          <BarChart2 className="menu-icon" />
          <span>Analytics</span>
        </button>
        <button className="menu-button">
          <Target className="menu-icon" />
          <span>Goals</span>
        </button>
        <button className="menu-button">
          <History className="menu-icon" />
          <span>History</span>
        </button>
        <button className="menu-button">
          <Bot className="menu-icon" />
          <span>AI Assistant</span>
        </button>
      </div>

      <div className="logout-section">
        <button className="menu-button" onClick={() => console.log("Log out clicked")}>
          <LogOut className="menu-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  </div> */}

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
