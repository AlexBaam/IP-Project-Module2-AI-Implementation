from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import GeminiAPI
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

if not os.path.exists('temp'):
    os.makedirs('temp')

if not os.path.exists('result'):
    os.makedirs('result')

API_KEY = "AIzaSyBnmOjPU5Nx0yh5A-ktmrWKdMcK2Iyuqq8"
gemini_instance = GeminiAPI.GeminiAPI(API_KEY)

@app.route('/generate-report', methods=['POST'])
def generate_report():
    try:
        # Add debug prints
        print("\nReceived request with files:", request.files)
        
        # Get uploaded files
        if 'files' not in request.files:
            return jsonify({"error": "No files uploaded"}), 400
            
        files = request.files.getlist('files')
        print(f"Received {len(files)} files")
        
        # Save files to temp folder
        saved_files = []
        for file in files:
            file_path = os.path.join('temp', file.filename)
            file.save(file_path)
            saved_files.append(file_path)
            print(f"Saved file: {file_path}")  # Debug log

        # Process with your Python script
        result_path = os.path.join('result', 'result.html')
        gemini_instance.make_html(saved_files, result_file=result_path, delete_files=True)

        # Return generated HTML
        with open(result_path, "r", encoding="utf-8") as file:
            html_content = file.read()
        return html_content
    
    except Exception as e:
        return str(e), 500

app.run(port=5000, debug=True)