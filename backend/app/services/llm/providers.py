"""Concrete LLM providers — fully async.

Each provider wraps a single vendor SDK. A provider is "available" when its
API key is configured (non-empty). Selection of which provider to use lives in
`connection.py`.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from importlib import import_module

from app.core.config import get_settings


class LLMError(Exception):
    """Raised when a provider call fails or no provider is configured."""


class LLMProvider(ABC):
    name: str

    @abstractmethod
    def is_available(self) -> bool: ...

    @abstractmethod
    async def generate(self, prompt: str) -> str: ...


# ── Gemini ──────────────────────────────────────────────────────────────
class GeminiProvider(LLMProvider):
    name = "gemini"

    def __init__(self) -> None:
        s = get_settings()
        self._api_key = s.gemini_api_key
        self._model = s.gemini_model
        self._client = None

    def is_available(self) -> bool:
        return bool(self._api_key)

    async def generate(self, prompt: str) -> str:
        try:
            import google.genai as genai
            if self._client is None:
                self._client = genai.Client(api_key=self._api_key)
            resp = await self._client.aio.models.generate_content(
                model=self._model, contents=prompt
            )
            return resp.text or ""
        except Exception as e:
            raise LLMError(f"gemini failed: {e}") from e


# ── Groq ────────────────────────────────────────────────────────────────
class GroqProvider(LLMProvider):
    name = "groq"

    def __init__(self) -> None:
        s = get_settings()
        self._api_key = s.groq_api_key
        self._model = s.groq_model
        self._async_client = None

    def is_available(self) -> bool:
        return bool(self._api_key)

    async def generate(self, prompt: str) -> str:
        try:
            AsyncGroq = import_module("groq").AsyncGroq
            if self._async_client is None:
                self._async_client = AsyncGroq(api_key=self._api_key)
            resp = await self._async_client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            raise LLMError(f"groq failed: {e}") from e


# Registry: name → class. Used by the connection module to pick a provider.
PROVIDER_REGISTRY: dict[str, type[LLMProvider]] = {
    GeminiProvider.name: GeminiProvider,
    GroqProvider.name: GroqProvider,
}
