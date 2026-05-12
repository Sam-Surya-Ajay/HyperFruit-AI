import os
import shutil
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename

from models.blueberry_model import predict_blueberry
from models.kaki_model import predict_kaki
from models.avocado_model import predict_avocado

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
DATASET_FOLDER = r"E:\NIT Calicut_Internship"

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'hdr'}

def allowed_file(filename):
    return '.' in filename and filename.lower().endswith('.hdr')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():

    fruit = request.form.get('fruit', '').strip().lower()

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only .hdr allowed"}), 400

    filename = secure_filename(file.filename)
    hdr_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(hdr_path)

    try:
        if fruit == 'blueberry':
            label, conf = predict_blueberry(hdr_path)

        elif fruit == 'kaki':
            label, conf = predict_kaki(hdr_path)

        elif fruit == 'avocado':
            label, conf = predict_avocado(hdr_path)

        else:
            return jsonify({"error": "Invalid fruit"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "result": label,
        "confidence": round(conf * 100, 2),
        "info": "Hyperspectral AI analysis completed"
    })


if __name__ == '__main__':
    app.run(debug=True)