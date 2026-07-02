"""LLM connection module.

Picks a single LLM provider based on which API key is configured (non-empty)
and exposes a simple `generate` entry point. There is no fallback chain — the
first provider (in `LLM_PROVIDERS` order) that has an available key is used.

Usage:
    from app.services.llm.connection import generate, get_provider
    text = await generate(prompt, method="my_prompt")
"""
from __future__ import annotations

import logging

from app.core.config import get_settings

from .providers import PROVIDER_REGISTRY, LLMError, LLMProvider

logger = logging.getLogger("llm_connection")
if not logger.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_h)
    logger.setLevel(logging.INFO)
    logger.propagate = False


def _provider_order() -> list[str]:
    """Provider names to consider, in priority order (from LLM_PROVIDERS)."""
    return [n.strip().lower() for n in get_settings().llm_providers.split(",") if n.strip()]


def get_provider() -> LLMProvider:
    """Return the first provider whose API key is configured (non-empty).

    Raises LLMError if no configured provider has a usable key.
    """
    for name in _provider_order():
        cls = PROVIDER_REGISTRY.get(name)
        if cls is None:
            logger.warning("LLM UNKNOWN provider in LLM_PROVIDERS: %s", name)
            continue
        provider = cls()
        if provider.is_available():
            logger.info("LLM PROVIDER selected: %s", provider.name)
            return provider
        logger.info("LLM SKIPPED: %s (no key)", name)
    raise LLMError("no LLM provider configured (all API keys empty)")


_provider: LLMProvider | None = None


def _get_cached_provider() -> LLMProvider:
    global _provider
    if _provider is None:
        _provider = get_provider()
    return _provider


def get_provider_info() -> dict[str, str]:
    provider = _get_cached_provider()
    return {
        "provider": provider.name,
        "model": str(getattr(provider, "_model", "")),
    }


def _classify_error(exc: Exception, provider_name: str) -> str:
    """Return a user-friendly message based on common LLM API error patterns."""
    msg = str(exc).lower()
    if "401" in msg or "invalid api key" in msg or "authentication" in msg or "unauthorized" in msg:
        return f"Invalid API key configured for {provider_name}. Please check your credentials."
    if "429" in msg or "rate limit" in msg or "quota" in msg or "exceeded" in msg:
        return f"{provider_name} API quota exceeded or rate limited. Please try again later or upgrade your plan."
    if "403" in msg or "forbidden" in msg or "permission" in msg:
        return f"Access denied by {provider_name}. Please verify your API key permissions."
    if "timeout" in msg or "timed out" in msg:
        return f"{provider_name} request timed out. Please try again."
    if "connection" in msg or "network" in msg:
        return f"Unable to connect to {provider_name}. Please check your network."
    return f"{provider_name} error: {exc}"


async def generate(prompt: str, method: str = "unknown") -> str:
    """Send a prompt through the connected provider. Raises LLMError on failure."""
    provider = _get_cached_provider()
    logger.info("LLM REQUEST  [%s][%s]:\n%s", provider.name, method, prompt)
    try:
        text = await provider.generate(prompt)
    except Exception as exc:
        api_key = getattr(provider, "_api_key", None) or getattr(provider, "api_key", "")
        masked_key = api_key[:6] + "..." + api_key[-4:] if api_key and len(api_key) > 10 else api_key
        friendly = _classify_error(exc, provider.name)
        logger.error(
            "LLM ERROR [%s][%s]: %s | api_key = \"%s\"",
            provider.name, method, exc, masked_key,
        )
        raise LLMError(friendly) from exc
    logger.info("LLM RESPONSE [%s][%s]:\n%s", provider.name, method, text)
    return text
