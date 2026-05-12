import spectral as sp
import numpy as np
import tensorflow as tf
import os

model = tf.keras.models.load_model("saved_models/blueberry_model.h5", compile=False)

def find_img_file(base):

    # Try .img
    if os.path.exists(base + ".img"):
        return base + ".img"

    # 🔥 HANDLE HIDDEN EXTENSION CASE (YOUR CASE)
    folder = os.path.dirname(base)
    name = os.path.basename(base)

    for f in os.listdir(folder):
        if f.startswith(name) and not f.endswith(".hdr"):
            return os.path.join(folder, f)

    raise Exception("No matching .img file found")


def predict_blueberry(hdr_path):

    base = hdr_path.replace(".hdr", "")

    data_path = find_img_file(base)

    img = sp.envi.open(hdr_path, image=data_path)
    data = np.array(img.load())

    # Preprocessing
    data = (data - np.mean(data, axis=(0,1))) / (np.std(data, axis=(0,1)) + 1e-6)
    data = np.clip(data, -3, 3)
    data = (data + np.roll(data,1,axis=2) + np.roll(data,-1,axis=2)) / 3

    data = np.expand_dims(data.astype(np.float32), axis=0)

    prob = model.predict(data)[0][0]

    label = "Bad" if prob > 0.38 else "Good"
    conf = prob if label == "Bad" else 1 - prob

    return label, float(conf)