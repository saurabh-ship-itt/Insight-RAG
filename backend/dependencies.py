"""
Dependency injection for FastAPI.
"""

import sys
import logging
from pathlib import Path
from functools import lru_cache

logger = logging.getLogger(__name__)

# Add src directory to path
SRC_DIR = str(Path(__file__).resolve().parent.parent / "src")
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from .config import settings
from .storage.file_store import FileStore
from .services.dataset_service import DatasetService
from .services.analysis import AnalysisService
from .services.rag_service import RAGService


@lru_cache()
def get_file_store() -> FileStore:
    settings.ensure_dirs()
    return FileStore(settings.upload_dir)


@lru_cache()
def get_dataset_service() -> DatasetService:
    return DatasetService(get_file_store())


@lru_cache()
def get_analysis_service() -> AnalysisService:
    try:
        from explainer.models import ExplanationConfig
        exp_config = ExplanationConfig(
            llm_provider=settings.llm_provider,
            llm_model=settings.llm_model,
            api_key=settings.groq_api_key or settings.openai_api_key,
        )
    except ImportError:
        logger.warning("explainer module not available (heavy ML deps absent); using None config")
        exp_config = None
    return AnalysisService(explanation_config=exp_config)


@lru_cache()
def get_rag_service() -> RAGService:
    return RAGService(index_path=settings.rag_index_path)
