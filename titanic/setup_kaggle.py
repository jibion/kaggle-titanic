"""Set up Kaggle credentials and download Titanic competition data."""

import os
import stat
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent   # titanic/
REPO_ROOT  = SCRIPT_DIR.parent                 # repo root


def load_env_file(env_path: Path) -> dict[str, str]:
    env_vars = {}
    with env_path.open() as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            key, _, value = line.partition("=")
            env_vars[key.strip()] = value.strip()
    return env_vars


def read_kaggle_key() -> str:
    """Return KAGGLE_KEY from env var, ~/.kaggle/access_token, or .env file."""
    if os.environ.get("KAGGLE_API_TOKEN"):
        print("[✓] KAGGLE_API_TOKEN already set in environment")
        return os.environ["KAGGLE_API_TOKEN"]

    access_token_path = Path.home() / ".kaggle" / "access_token"
    if access_token_path.exists():
        token = access_token_path.read_text().strip()
        if token:
            print(f"[✓] Kaggle token found at {access_token_path}")
            return token

    env_path = REPO_ROOT / ".env"
    if not env_path.exists():
        sys.exit(
            f"[✗] .env file not found at {env_path}. "
            "Copy .env.example to .env and fill in your credentials."
        )

    print(f"[~] access_token not found — reading credentials from {env_path} ...")
    env_vars = load_env_file(env_path)
    key = env_vars.get("KAGGLE_KEY")
    if not key:
        sys.exit("[✗] KAGGLE_KEY missing from .env")

    access_token_path.parent.mkdir(parents=True, exist_ok=True)
    access_token_path.write_text(key)
    access_token_path.chmod(stat.S_IRUSR | stat.S_IWUSR)  # chmod 600
    print(f"[✓] Saved token to {access_token_path}")
    return key


def download_titanic_data(token: str) -> None:
    raw_dir = SCRIPT_DIR / "data" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    expected = ["train.csv", "test.csv", "gender_submission.csv"]
    if all((raw_dir / f).exists() for f in expected):
        print(f"[✓] Titanic data already present in {raw_dir}/")
        return

    print(f"[~] Downloading Titanic competition data into {raw_dir}/ ...")

    kaggle_bin = Path(sys.executable).parent / "kaggle"
    if not kaggle_bin.exists():
        kaggle_bin = Path("kaggle")  # fall back to PATH

    env = {**os.environ, "KAGGLE_API_TOKEN": token}
    result = subprocess.run(
        [str(kaggle_bin), "competitions", "download", "-c", "titanic", "-p", str(raw_dir)],
        capture_output=True,
        text=True,
        env=env,
    )

    if result.returncode != 0:
        print(result.stderr)
        sys.exit("[✗] kaggle download failed — see error above")

    for zip_file in raw_dir.glob("*.zip"):
        print(f"[~] Unzipping {zip_file.name} ...")
        subprocess.run(["unzip", "-o", str(zip_file), "-d", str(raw_dir)], check=True)
        zip_file.unlink()

    print(f"[✓] Data downloaded to {raw_dir}/")


def verify_files() -> None:
    raw_dir = SCRIPT_DIR / "data" / "raw"
    expected = ["train.csv", "test.csv", "gender_submission.csv"]
    missing = [f for f in expected if not (raw_dir / f).exists()]

    if missing:
        print(f"[!] These expected files are still missing: {missing}")
    else:
        print(f"[✓] All expected files present in {raw_dir}/")
        for name in expected:
            size = (raw_dir / name).stat().st_size
            print(f"    {name}: {size:,} bytes")


if __name__ == "__main__":
    token = read_kaggle_key()
    download_titanic_data(token)
    verify_files()
    print("\nDone. You're ready to explore the data!")
