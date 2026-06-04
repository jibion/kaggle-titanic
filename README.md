# Kaggle — Titanic

[![Data Story](https://img.shields.io/badge/Data%20Story-View-c9a84c?style=flat-square)](https://jibion.github.io/kaggle-titanic/titanic/)

Kaggle competition work for the [Titanic — Machine Learning from Disaster](https://www.kaggle.com/c/titanic) challenge.

## Phases

| Phase | Status | Link |
|-------|--------|------|
| 1 — Exploratory Data Analysis | ✅ Done | [Data story](https://jibion.github.io/kaggle-titanic/titanic/) |
| 2 — Feature Engineering | 🔄 In progress | [Notebook](titanic/notebooks/02_feature_engineering.ipynb) |
| 3 — Baseline Model | ⬜ Not started | — |
| 4 — Tuning & Submission | ⬜ Not started | — |

## Structure

```
titanic/         ← competition code
├── data/        ← gitignored; download via setup_kaggle.py
├── notebooks/   ← one notebook per phase
├── src/         ← reusable Python modules
└── submissions/ ← CSVs named YYYY-MM-DD_model_score.csv
docs/            ← GitHub Pages
├── index.html   ← Titanic competition index
└── titanic/     ← EDA data story
```

## Submission Log

| Date | Model | CV Score | LB Score | Notes |
|------|-------|----------|----------|-------|
|      |       |          |          |       |

## Setup

Run everything from the **repo root**:

```bash
python titanic/setup_env.py   # creates .venv at repo root, installs packages
cp .env.example .env          # fill in your Kaggle API key (KAGGLE_KEY)
python titanic/setup_kaggle.py  # downloads competition data to titanic/data/raw/
```
