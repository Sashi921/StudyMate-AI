from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY_HERE":
    raise RuntimeError("Please add your Gemini API key in .env")

client = genai.Client(api_key=API_KEY)


def build_prompt(feature, content):

    prompts = {

        "summary": f"""
You are a student study assistant.

Summarize the following study notes.

Rules:
- Keep important information.
- Use simple language.
- Use headings and bullet points.
- Do not invent facts.
- Make it useful for exam revision.

Notes:
{content}
""",

        "quiz": f"""
You are a quiz generator for students.

Create exactly 5 multiple-choice questions from the material below.

Rules:
- Each question has A, B, C and D.
- Give the correct answer.
- Give a short explanation.
- Use only information from the provided material.

Study Material:
{content}
""",

        "improve": f"""
You are an academic answer improvement assistant.

Improve the student's answer.

Rules:
- Correct grammar.
- Improve clarity.
- Improve structure.
- Make it exam-ready.
- Preserve the original meaning.
- Do not add unsupported facts.

Student Answer:
{content}
""",

        "explain": f"""
You are a friendly college teacher.

Explain the following concept to a beginner.

Use this structure:
1. Simple Definition
2. Easy Explanation
3. Example
4. Important Points
5. Exam-Ready Answer

Keep the explanation simple and clear.

Concept:
{content}
"""
    }

    return prompts.get(feature)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Invalid request."
            }), 400

        feature = data.get("feature", "").strip()
        content = data.get("content", "").strip()

        valid_features = [
            "summary",
            "quiz",
            "improve",
            "explain"
        ]

        if feature not in valid_features:
            return jsonify({
                "success": False,
                "error": "Invalid study utility."
            }), 400

        if not content:
            return jsonify({
                "success": False,
                "error": "Please enter some content."
            }), 400

        if len(content) > 12000:
            return jsonify({
                "success": False,
                "error": "Content is too long. Maximum 12,000 characters."
            }), 400

        prompt = build_prompt(feature, content)

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        if not response.text:
            return jsonify({
                "success": False,
                "error": "AI returned an empty response."
            }), 500

        return jsonify({
            "success": True,
            "result": response.text.strip()
        })

    except Exception as error:

        print("ERROR:", error)

        return jsonify({
            "success": False,
            "error": "AI service error. Please check your API key and try again."
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )