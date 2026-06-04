# Titanic - Machine Learning from Disaster

## Project Overview

Kaggle competition: predict survival on the Titanic using passenger data.
Competition page: https://www.kaggle.com/c/titanic

## Setup

1. Clone the repo and create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and fill in your Kaggle credentials:
   ```bash
   cp .env.example .env
   ```

3. Download competition data:
   ```bash
   kaggle competitions download -c titanic -p data/raw/
   unzip data/raw/titanic.zip -d data/raw/
   ```

## Workflow

```
data/raw/        ← original competition files (gitignored)
data/processed/  ← cleaned and feature-engineered datasets (gitignored)
notebooks/       ← exploratory and experimental notebooks
src/             ← reusable Python modules (feature engineering, training, etc.)
models/          ← serialized model artifacts (gitignored)
submissions/     ← generated submission CSVs (gitignored)
```

1. Explore data in `notebooks/`.
2. Promote stable logic to `src/`.
3. Train models, evaluate with cross-validation, save to `models/`.
4. Generate submission CSV, upload to Kaggle, record results below.

## Submission Log

| Date | Model | CV Score | LB Score | Notes |
|------|-------|----------|----------|-------|
|      |       |          |          |       |
