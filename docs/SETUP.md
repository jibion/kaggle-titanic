# Project Setup

Follow these steps in order to get the environment and data ready.

---

## 1. Copy `.env.example` and fill in credentials

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values with your Kaggle credentials:

```
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key
```

Find your API key at <https://www.kaggle.com/settings> → **API** → **Create New Token**.

> **Never commit `.env`** — it is already listed in `.gitignore`.

---

## 2. Create the virtual environment and install dependencies

```bash
python setup_env.py
```

This creates `.venv/` and installs everything in `requirements.txt`.

---

## 3. Activate the virtual environment

**Mac / Linux**

```bash
source .venv/bin/activate
```

**Windows (PowerShell)**

```powershell
.venv\Scripts\Activate.ps1
```

**Windows (cmd)**

```cmd
.venv\Scripts\activate.bat
```

You should see `(.venv)` prepended to your prompt.

---

## 4. Download the Titanic competition data

```bash
python setup_kaggle.py
```

The script will:

1. Create `~/.kaggle/kaggle.json` from your `.env` credentials if it doesn't exist yet.
2. Download the competition files into `data/raw/`.
3. Unzip the archive and print a file listing when done.

---

## 5. Confirm the data is present

Check that `data/raw/` contains these three files:

```
data/raw/
├── gender_submission.csv
├── test.csv
└── train.csv
```

If any file is missing, re-run `python setup_kaggle.py` and check for errors printed to the console.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `[✗] .env file not found` | Step 1 — copy `.env.example` to `.env` |
| `kaggle: command not found` | Make sure the venv is active and `kaggle` is in `requirements.txt` |
| `403 Forbidden` from Kaggle | Accept the Titanic competition rules at kaggle.com first |
| Zip not unzipping | Install `unzip` (`sudo apt install unzip` on Ubuntu/WSL) |
