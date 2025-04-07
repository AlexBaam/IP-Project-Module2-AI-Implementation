import os
import tkinter as tk
from tkinter import filedialog, messagebox
import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from docx import Document
from ocr_db_handler import parse_transaction_data, insert_to_postgres
import re  # for regulated expressions

# DOAR PT WINDOWS!!!!! aici pui calea/path-ul catre tesseract.exe
pytesseract.pytesseract.tesseract_cmd = r"C:\Users\ecate\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"

selected_file = None  # active folder

# we use this function to extract text from .docx files
# (we use the python-docx library)
def extract_text_from_docx(path):
    try:
        doc = Document(path)
        text = "\n".join([par.text for par in doc.paragraphs])
        return text
    except Exception as e:
        return f"Error reading .docx: {e}"

# we use this function to extract text from .pdf files
# (we use the PyMuPDF library)
def extract_text_from_pdf(path):
    try:
        text = ""
        doc = fitz.open(path)
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception:
        return ""
    
# we use this function to extract text from .pdf files using OCR
# (we use the pdf2image library to convert PDF pages to images and pytesseract for OCR)
def extract_text_pdf_with_ocr(path):
    try:
        text = ""
        images = convert_from_path(path)
        for img in images:
            text += pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        return f"OCR error: {e}"

# we use this function to find the IBAN code in the text
def find_iban(text):
    # searching for the IBAN code using a regular expression
    # the IBAN code is usually 24 characters long and starts with 'RO'
    pattern = r"(IBAN\s*[:]?|\bNew IBAN Code:\s*|\bCod IBAN Nou:\s*)(\S+)"
    iban_found = re.findall(pattern, text, re.IGNORECASE)

    if iban_found:
        # we save the IBAN codes in a file called 'iban.txt'
        with open("iban.txt", "a") as f:
            for iban in iban_found:
                f.write(iban[1] + "\n")  # 
    
    return [iban[1] for iban in iban_found]  # returning only the IBAN codes

# function for selecting a file
def select_file():
    global selected_file
    file_path = filedialog.askopenfilename(
        title="Select a file",
        filetypes=[("Accepted Documents", "*.pdf *.docx *.doc"),
                  ("All Files", "*.*")]
    )

    if not file_path:
        return

    if not os.path.isfile(file_path):
        messagebox.showerror("Error", "The file does not exist.")
        return

    file_name = os.path.basename(file_path)
    name, extension = os.path.splitext(file_name)
    extension = extension.lower()
    size = os.path.getsize(file_path)

    accepted_extensions = ['.pdf', '.docx', '.doc']
    if extension not in accepted_extensions:
        messagebox.showerror("Error", f"Extension '{extension}' is not accepted.")
        return

    if size == 0:
        messagebox.showerror("Error", "The file is empty.")
        return

    selected_file = file_path
    extracted_text = ""

    if extension == ".docx":
        extracted_text = extract_text_from_docx(file_path)
    elif extension == ".pdf":
        extracted_text = extract_text_from_pdf(file_path)
        if not extracted_text.strip():
            # if no text is found, we use OCR
            extracted_text = extract_text_pdf_with_ocr(file_path)

    # we search for the IBAN code in text
    iban_found = find_iban(extracted_text)

    transaction_data = parse_transaction_data(extracted_text)
    insert_to_postgres(transaction_data)
    
    message = f"Valid file!\n\nName: {name}\nExtension: {extension}\nSize: {size} bytes\n"
    if iban_found:
        message += f"'IBAN' found in document: {', '.join(iban_found)}"
    else:
        message += "'IBAN' NOT found."
    
    info_message.config(text=message)
    reset_button.config(state=tk.NORMAL)

# resetting the selection
def reset_selection():
    global selected_file
    selected_file = None
    info_message.config(text="No file selected.")
    reset_button.config(state=tk.DISABLED)

# graphic interface
root = tk.Tk()
root.title("Document Checker + OCR")
root.geometry("450x300")

label = tk.Label(root, text="Select a PDF or Word file for verification and OCR:")
label.pack(pady=10)

select_button = tk.Button(root, text="Select File", command=select_file)
select_button.pack(pady=5)

info_message = tk.Label(root, text="No file selected.", wraplength=420, justify="left")
info_message.pack(pady=15)

reset_button = tk.Button(root, text="Clear Selection", command=reset_selection, state=tk.DISABLED)
reset_button.pack(pady=5)

root.mainloop()
