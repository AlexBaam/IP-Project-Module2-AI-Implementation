import google.generativeai as genai # python -m pip install google-generativeai
import pymupdf # python -m pip install pymupdf
import os
import re
import json

BANK_STATEMENT_PROMPT_RO = ("buna so eu am un extras de cont, ai putea sa il analizezi si sa faci niste statistici?"
                         "vreau sa faci statisticile astea sub forma de pie charts sau alte tipuri de charts."
                         "Afiseaza astea sub forma de cod folosind html si javascript unde o sa folosesti apache echarts."
                         "Trimite doar codul, absolut nimic mai mult. Pune tot codul intr-un singur fisier html."
                         "Statisticile necesare sunt urmatoarele:")

BANK_STATEMENT_PROMPT = ("Hi so I have a bank statement, could you analyze it and make some statistics?"
                         "I want you to make these statistics as pie charts, bar charts, line charts, or other chart types."
                         "Send these as html and javascript code where you will use apache echarts."
                         "Send ONLY the code, not a single thing more. Write the whole code in a single html file."
                         "The necessary statistics are the following:")

STATISTICS_RO = ("impartirea banilor cheltuiti pe zilele saptamanii",
                   "impartirea banilor cheltuiti pe comercianti/magazine",
                   "total bani cheltuiti",
                   "total bani primiti",
                   "impartirea banilor primiti pe de unde au fost primiti",
                   "impartirea banilor cheltuiti pe diverse categorii, cum ar fi magazine alimentare, divertisment, salon etc")

STATISTICS = ("the money spent on different days of the week",
              "the money spent on different shops/sellers",
              "total money received",
              "total money spent",
              "the money received on different places/people they were received from",
              "the money spent on different categories, such as groceries, transport, salon, fun, etc",
              "the money left in the account each")

MODEL = "gemini-2.0-flash"


class GeminiAPI:
    def __init__(self, api_key, statistics=STATISTICS, gemini_prompt=BANK_STATEMENT_PROMPT, model=MODEL):
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.statistics = statistics
        self.model = genai.GenerativeModel(model)
        self.chat = None
        self.gemini_prompt = gemini_prompt + ' '.join(statistics)
        
        self.history_file = os.path.join("chat_history", "history.json")
        os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
        self._load_history()


    def _save_history(self):
        if self.chat:
            history = []
            for msg in self.chat.history:
                history.append({
                    'role': msg.role,
                    'parts': [part.text for part in msg.parts]
                })
            
            with open(self.history_file, 'w') as f:
                json.dump(history, f)


    def _load_history(self):
        try:
            with open(self.history_file, 'r') as f:
                history = json.load(f)
                # Start new chat with loaded history
                self.chat = self.model.start_chat(history=history)
        except (FileNotFoundError, json.JSONDecodeError, Exception):
            # Start fresh chat if any error occurs
            self.chat = self.model.start_chat(history=[])


    def _convert_pdf_to_images(self, pdf_path, output_path=None):
        if output_path is None:
            output_path = pdf_path

        document = pymupdf.open(pdf_path)
        output = []

        for page in document:
            pix = page.get_pixmap()
            pix.save(f'{output_path} - page {page.number}.png')
            output.append(f'{output_path} - page {page.number}.png')
            print(f"Converted page {page.number + 1} from {output_path}")

        document.close()
        if os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except PermissionError:
                print(f"Could not delete {pdf_path}, skipping")

        return output


    def _replace_documents_with_images(self, files):
        new_files = []

        for file in files:
            if file[-4:] == ".pdf" or file[-4:] == ".doc" or file[-5:] == ".docx":
                print(f"Processing Document: {file}")
                for image in self._convert_pdf_to_images(file):
                    new_files.append(image)
            elif file[-4:] in [".jpg", ".png"] or file[-5:] == ".jpeg":
                new_files.append(file)

        return new_files


    def prompt(self, prompt_text, files=None, delete_files=False):
        if files:
            images = self._replace_documents_with_images(files)
            contents = [prompt_text] + [genai.upload_file(img) for img in images]
            response = self.chat.send_message(contents)
        else:
            response = self.chat.send_message(prompt_text)

        self._save_history()
        return response.text


    def bank_statement_prompt(self, files, prompt_text=None, delete_files=False):
        if prompt_text is None:
            prompt_text = self.gemini_prompt

        response = self.prompt(prompt_text, files, delete_files)

        for match in re.findall("```\S*", response):
            response = response.replace(match, "")

        return response


    def make_html(self, files, result_file="result.html", prompt_text=None, delete_files=False):
        if prompt_text is None:
            prompt_text = self.gemini_prompt

        with open(result_file, "w", encoding="utf-8") as file:
            file.write(self.bank_statement_prompt(files, prompt_text, delete_files))