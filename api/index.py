import sys
from pathlib import Path

# Ensure project root and src are on the Python path for Vercel serverless
ROOT = Path(__file__).resolve().parent.parent
for d in (str(ROOT), str(ROOT / "src")):
    if d not in sys.path:
        sys.path.insert(0, d)

from backend.main import app
