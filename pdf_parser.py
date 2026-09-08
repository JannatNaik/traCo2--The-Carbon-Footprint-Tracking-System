import PyPDF2
import re
import sys
import json
import os

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def extract_electricity_units(text):
    """
    Extracts the electricity consumption (units) from the bill text.
    Assumes that the units appear as 'Units Consumed: XXX' or similar.
    """
    unit_pattern = re.search(r"Units?\s*Consumed[:\s]+(\d+\.?\d*)", text, re.IGNORECASE)
    
    if unit_pattern:
        return float(unit_pattern.group(1))  # Extract and return the numeric value
    return None  # Return None if no match is found

if __name__ == "__main__":
    file_path = sys.argv[1]  # Receive file path from Java

    # Check the file extension and extract text accordingly
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == ".pdf":
        extracted_text = extract_text_from_pdf(file_path)
        electricity_units = extract_electricity_units(extracted_text)

        if electricity_units is not None:
            result = {
                "resume_text": extracted_text,
                "electricity_units": electricity_units,
                "calculated_consumption": electricity_units * 0.92  # Example conversion factor
            }
        else:
            result = {
                "resume_text": extracted_text,
                "error": "Electricity units not found in the bill."
            }

    else:
        result = {"error": "Unsupported file format. Please upload a PDF electricity bill."}

    # Return the extracted data in JSON format
    print(json.dumps(result, indent=4))
