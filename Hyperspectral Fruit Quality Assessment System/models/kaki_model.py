import numpy as np
import spectral
import joblib
import os

model = joblib.load("saved_models/kaki_model.pkl")

def find_img_file(base):

    if os.path.exists(base + ".img"):
        return base + ".img"

    folder = os.path.dirname(base)
    name = os.path.basename(base)

    for f in os.listdir(folder):
        if f.startswith(name) and not f.endswith(".hdr"):
            return os.path.join(folder, f)

    raise Exception("No matching .img file found")


def predict_kaki(hdr_path):

    base = hdr_path.replace(".hdr","")

    data_path = find_img_file(base)

    img = spectral.envi.open(hdr_path, image=data_path)
    cube = np.array(img.load())

    mask = np.sum(cube, axis=2) > 0
    pixels = cube[mask]

    mean = pixels.mean(axis=0)
    std = pixels.std(axis=0)
    maxv = pixels.max(axis=0)
    minv = pixels.min(axis=0)
    gradient = np.gradient(mean)
    ratio = mean / (np.max(mean) + 1e-6)

    feat = np.concatenate([mean, std, maxv, minv, gradient, ratio]).reshape(1,-1)

    pred = model.predict(feat)[0]
    prob = model.predict_proba(feat)[0]

    if pred == 0:
        return "Perfect", float(prob[0])
    else:
        return "Overripe", float(prob[1])