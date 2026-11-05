import sys
import os
from pathlib import Path

# Ensure project root and backend are on the Python path for Vercel serverless
ROOT = Path(__file__).resolve().parent.parent
for d in (str(ROOT), str(ROOT / "src"), str(ROOT / "backend")):
    if d not in sys.path:
        sys.path.insert(0, d)

# Vercel serverless: heavy ML packages (sentence-transformers, faiss, scipy)
# are NOT available — backend gracefully degrades when they're missing.
from backend.main import app
