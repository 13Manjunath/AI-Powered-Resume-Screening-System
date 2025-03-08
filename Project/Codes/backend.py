from flask import Flask, request, jsonify
import PyPDF2
import docx
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

def extract_text_from_pdf(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file)
    return "\n".join([para.text for para in doc.paragraphs])


def extract_skills(text):
    skills = ["Python", "Java", "AWS", "Docker", "Kubernetes", "Flask", "FastAPI", "CI/CD", "Machine Learning"]
    found_skills = [skill for skill in skills if re.search(skill, text, re.IGNORECASE)]
    return found_skills


def calculate_match_score(resume_text, job_description):
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, job_description])
    score = cosine_similarity(vectors[0], vectors[1])[0][0] * 100
    return round(score, 2)


@app.route('/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    job_description = request.form.get("job_description", "")

    if file.filename.endswith('.pdf'):
        resume_text = extract_text_from_pdf(file)
    elif file.filename.endswith('.docx'):
        resume_text = extract_text_from_docx(file)
    else:
        return jsonify({"error": "Invalid file format. Please upload PDF or DOCX."}), 400

    extracted_skills = extract_skills(resume_text)
    match_score = calculate_match_score(resume_text, job_description)

    return jsonify({
        "extracted_skills": extracted_skills,
        "match_score": match_score,
        "message": "Resume processed successfully!"
    })


if __name__ == '__main__':
    app.run(debug=True)
