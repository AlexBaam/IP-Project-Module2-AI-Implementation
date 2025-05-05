from google import genai # python -m pip install google-genai
import pymupdf # python -m pip install pymupdf
import os
import re

BANK_STATEMENT_PROMPT = ("buna so eu am un extras de cont, ai putea sa il analizezi si sa faci niste statistici?"
                         "vreau sa faci statisticile astea sub forma de pie charts sau alte tipuri de charts."
                         "Afiseaza astea sub forma de cod folosind html si javascript unde o sa folosesti apache echarts."
                         "Trimite doar codul, absolut nimic mai mult. Pune tot codul intr-un singur fisier html."
                         "Statisticile necesare sunt urmatoarele:")

STATISTICS = ("impartirea banilor cheltuiti pe zilele saptamanii",
                   "impartirea banilor cheltuiti pe comercianti/magazine",
                   "total bani cheltuiti",
                   "total bani primiti",
                   "impartirea banilor primiti pe de unde au fost primiti",
                   "impartirea banilor cheltuiti pe diverse categorii, cum ar fi magazine alimentare, divertisment, salon etc")

MODEL = "gemini-2.0-flash"


class GeminiAPI:
    def __init__(self, api_key, statistics=STATISTICS, gemini_prompt=BANK_STATEMENT_PROMPT, model=MODEL):
        self.api_key = api_key
        self.statistics = statistics
        self.model = model
        self.gemini_prompt = gemini_prompt + ' '.join(statistics)

        self.client = genai.Client(api_key=api_key)


    def convert_pdf_to_images(self, pdf_path, output_path=None):
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


    def replace_documents_with_images(self, files):
        new_files = []

        for file in files:
            if file[-4:] == ".pdf":
                print(f"Processing PDF: {file}")
                for image in self.convert_pdf_to_images(file):
                    new_files.append(image)
            elif file[-4:] in [".jpg", ".png"] or file[-5:] == ".jpeg":
                new_files.append(file)

        return new_files


    def prompt(self, prompt_text, files=None, delete_files=False):
        if files is None:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt_text
            )
        else:
            images = self.replace_documents_with_images(files)
            new_files = []

            for file in images:
                new_files.append(self.client.files.upload(file=file))

            response = self.client.models.generate_content(
                model=self.model,
                contents=[new_files, prompt_text]
            )

            if delete_files:
                for file in images:
                    if os.path.exists(file):
                        try:
                            os.remove(file)
                        except PermissionError:
                            print(f"Could not delete {file}, skipping") 

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