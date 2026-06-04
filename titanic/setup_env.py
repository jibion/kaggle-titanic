"""Create .venv and install requirements.txt into it."""

import subprocess
import sys
from pathlib import Path


VENV_DIR = Path(".venv")
REQUIREMENTS = Path("requirements.txt")


def create_venv() -> None:
    if VENV_DIR.exists():
        print(f"[✓] Virtual environment already exists at {VENV_DIR}/")
        return

    print(f"[~] Creating virtual environment at {VENV_DIR}/ ...")
    subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)
    print(f"[✓] Virtual environment created")


def install_requirements() -> None:
    if not REQUIREMENTS.exists():
        sys.exit(f"[✗] {REQUIREMENTS} not found")

    pip = VENV_DIR / "bin" / "pip"
    if not pip.exists():
        pip = VENV_DIR / "Scripts" / "pip.exe"  # Windows fallback

    print(f"[~] Installing packages from {REQUIREMENTS} ...")
    subprocess.run([str(pip), "install", "--upgrade", "pip"], check=True)
    subprocess.run([str(pip), "install", "-r", str(REQUIREMENTS)], check=True)
    print(f"[✓] All packages installed")


def print_activation_instructions() -> None:
    print("\nTo activate the virtual environment:")
    print("  Mac/Linux:  source .venv/bin/activate")
    print("  Windows:    .venv\\Scripts\\activate")
    print("\nThen run:  python setup_kaggle.py")


if __name__ == "__main__":
    create_venv()
    install_requirements()
    print_activation_instructions()
