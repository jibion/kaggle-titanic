# Kaggle — Titanic

[![Data Story](https://img.shields.io/badge/Data%20Story-View-c9a84c?style=flat-square)](https://jibion.github.io/kaggle-titanic/titanic/)

Kaggle competition work for the [Titanic — Machine Learning from Disaster](https://www.kaggle.com/c/titanic) challenge.

## Pages

| | |
|---|---|
| Competition index | https://jibion.github.io/kaggle-titanic/ |
| Titanic data story | https://jibion.github.io/kaggle-titanic/titanic/ |

## Structure

```
titanic/         ← competition code
├── data/        ← gitignored; see data/README.md to download
├── notebooks/   ← EDA and modelling notebooks
├── src/         ← reusable Python modules
└── submissions/ ← CSVs named YYYY-MM-DD_model_score.csv
shared/          ← utilities reused across competitions
docs/            ← GitHub Pages
├── index.html   ← competition index
└── titanic/     ← data story
```

## Submission Log

| Date | Model | CV Score | LB Score | Notes |
|------|-------|----------|----------|-------|
|      |       |          |          |       |

## Setup

```bash
cd titanic
python setup_env.py        # creates .venv and installs requirements
cp ../.env.example ../.env # add your Kaggle API key
python setup_kaggle.py     # downloads competition data
```
