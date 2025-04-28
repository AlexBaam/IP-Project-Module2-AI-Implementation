import React, { useState } from 'react';

type ReportType = 'bar' | 'pie' | 'line' | '';

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [reportType, setReportType] = useState<ReportType>('');
  const [useOCR, setUseOCR] = useState<boolean>(false);
  const [useAI, setUseAI] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const validFiles = selectedFiles.filter(file => allowedTypes.includes(file.type));
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Please upload at least one file!');
      return;
    }

    if (!reportType) {
      alert('Please select a report type!');
      return;
    }

    // prepare form data for backend
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('reportType', reportType);
    formData.append('useOCR', String(useOCR));
    formData.append('useAI', String(useAI));

    console.log('Prepared for backend:', { reportType, useOCR, useAI, files });

    //sending to backend:
    /*
   
    */
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a202c', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Dashboard Report Generator</h1>

      <div style={{ backgroundColor: '#2d3748', borderRadius: '10px', padding: '30px', width: '100%', maxWidth: '600px', boxShadow: '0px 0px 10px rgba(0,0,0,0.5)' }}>
        
        {/* File Upload */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '18px' }}>Upload files (PDF or DOCX)</label>
          <input
            type="file"
            multiple
            accept=".pdf, .docx"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
          />
          <ul style={{ marginTop: '10px', fontSize: '14px', color: '#a0aec0' }}>
            {files.map((file, idx) => (
              <li key={idx} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {file.name}
                <button 
                  onClick={() => handleRemoveFile(idx)}
                  style={{ backgroundColor: 'red', border: 'none', borderRadius: '4px', padding: '5px 10px', color: 'white', cursor: 'pointer', marginLeft: '10px' }}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Dropdown */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '18px' }}>Select report type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
          >
            <option value="">-- Select --</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <input
              type="checkbox"
              checked={useOCR}
              onChange={() => setUseOCR(prev => !prev)}
              id="ocr-toggle"
            />
            <label htmlFor="ocr-toggle" style={{ marginLeft: '8px', fontSize: '16px' }}>OCR</label>
          </div>

          <div>
            <input
              type="checkbox"
              checked={useAI}
              onChange={() => setUseAI(prev => !prev)}
              id="ai-toggle"
            />
            <label htmlFor="ai-toggle" style={{ marginLeft: '8px', fontSize: '16px' }}>AI</label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          style={{ width: '100%', padding: '15px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
        >
          Submit
        </button>

      </div>
    </div>
  );
};

export default Dashboard;
