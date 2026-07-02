"""LLM provider abstraction with key-based provider selection.

Public API:
    from app.services.llm import generate, get_provider, get_provider_info, LLMError
    text = await generate(prompt, method="my_prompt")
"""
from .connection import generate, get_provider, get_provider_info
from .providers import LLMError

__all__ = ["generate", "get_provider", "get_provider_info", "LLMError"]
