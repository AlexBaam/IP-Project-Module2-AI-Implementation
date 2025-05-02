import { useState } from "react";
import "./Dashboard.css"; // dacă vrei să pui stil separat, opțional

export default function Dashboard() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    
    const validFiles = files.filter(file => 
      validExtensions.some(ext => file.name.endsWith(ext))
    );
    
    setSelectedFiles(validFiles);
  };

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || !selectedOption || !selectedMethod) {
      alert("Te rog să selectezi fișiere, o opțiune și o metodă (AI/OCR) înainte de trimitere.");
      return;
    }
  
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('reportType', selectedOption);
    formData.append('useOCR', selectedMethod === 'OCR');
    formData.append('useAI', selectedMethod === 'AI');
  
    try {
      const response = await fetch('http://localhost:5000/generate-report', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eroare server: ${errorText}`);
      }
  
      // Clear state ONLY on success
      setSelectedFiles([]);
      setSelectedOption("");
      setSelectedMethod("");
      
      alert("Raport generat cu succes!");
  
    } catch (error) {
      console.error('Eroare:', error);
      alert(`Generare raport eșuată: ${error.message}`);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Upload Fișiere și Analiză</h1>

      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple
        onChange={handleFileChange}
        className="file-input"
      />

      <select
        value={selectedOption}
        onChange={handleDropdownChange}
        className="dropdown"
      >
        <option value="">Selectează o opțiune</option>
        <option value="impartire_zile">Împărțirea banilor pe zilele săptămânii</option>
        <option value="impartire_magazine">Împărțirea banilor pe magazine/comercianți</option>
        <option value="total_cheltuieli">Total bani cheltuiți</option>
        <option value="total_primiti">Total bani primiți</option>
        <option value="impartire_categorii">Împărțirea banilor primiți pe categorii</option>
      </select>

      <div className="method-buttons">
        <button
          onClick={() => handleMethodSelect("AI")}
          className={selectedMethod === "AI" ? "selected" : ""}
        >
          AI
        </button>
        <button
          onClick={() => handleMethodSelect("OCR")}
          className={selectedMethod === "OCR" ? "selected" : ""}
        >
          OCR
        </button>
      </div>

      <button
        onClick={handleSubmit}
        className="submit-button"
      >
        Trimite
      </button>

      <div className="debug-info">
        <h2>Fișiere selectate:</h2>
        <ul>
          {selectedFiles.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>

        <p><strong>Opțiune:</strong> {selectedOption || "Nimic selectat"}</p>
        <p><strong>Metodă:</strong> {selectedMethod || "Nimic selectat"}</p>
      </div>
    </div>
  );
}
