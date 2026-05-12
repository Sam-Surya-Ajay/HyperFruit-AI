import numpy as np
import spectral
import joblib
import os

model = joblib.load("saved_models/avocado_model.pkl")

def predict_avocado(hdr_path):

    base = hdr_path.replace(".hdr","")

    if not os.path.exists(base + ".bin"):
        raise Exception("Missing .bin file")

    data_path = base + ".bin"

    img = spectral.envi.open(hdr_path, image=data_path)
    cube = np.array(img.load())

    H, W, B = cube.shape

    PATCH = 64
    STRIDE = 32

    feats = []

    for i in range(0, H - PATCH, STRIDE):
        for j in range(0, W - PATCH, STRIDE):

            patch = cube[i:i+PATCH, j:j+PATCH, :]

            if np.sum(patch) == 0:
                continue

            spec = np.mean(patch, axis=(0,1))
            diff = np.diff(spec)

            ratio1 = spec[140] / (spec[100] + 1e-6)
            ratio2 = spec[180] / (spec[120] + 1e-6)

            slope1 = np.mean(diff[100:140])
            slope2 = np.mean(diff[140:180])

            mean = np.mean(spec)
            std = np.std(spec)

            feats.append(np.concatenate([spec, diff, [ratio1, ratio2, slope1, slope2, mean, std]]))

    feats = np.array(feats)

    final = np.concatenate([
        np.mean(feats, axis=0),
        np.std(feats, axis=0)
    ]).reshape(1,-1)

    pred = model.predict(final)[0]
    prob = model.predict_proba(final)[0]

    labels = ["Unripe", "Perfect", "Overripe"]

    return labels[pred], float(np.max(prob))