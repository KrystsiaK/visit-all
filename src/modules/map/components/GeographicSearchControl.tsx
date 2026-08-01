"use client";

import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { searchGeography } from "@/modules/map/services/geocoding";
import type { GeographicSearchResult } from "@/modules/map/types";

interface GeographicSearchControlProps {
  onSelect: (result: GeographicSearchResult) => void;
}

export function GeographicSearchControl({ onSelect }: GeographicSearchControlProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeographicSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchPaused, setSearchPaused] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (searchPaused || normalizedQuery.length < 3) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError(false);

      void searchGeography(normalizedQuery, { signal: controller.signal })
        .then(setResults)
        .catch((requestError) => {
          if (requestError instanceof DOMException && requestError.name === "AbortError") return;
          setResults([]);
          setError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, searchPaused]);

  const clear = () => {
    setQuery("");
    setResults([]);
    setError(false);
    setSearchPaused(false);
  };

  return (
    <div className="pointer-events-auto absolute bottom-8 left-1/2 z-30 w-[min(360px,calc(100vw-2rem))] -translate-x-1/2">
      <div className="relative flex h-12 items-center gap-3 rounded-2xl border border-black/10 bg-white/92 px-4 shadow-[0px_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {loading ? (
          <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-neutral-500" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-neutral-500" />
        )}
        <input
          type="search"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setSearchPaused(false);
            if (nextQuery.trim().length < 3) {
              setResults([]);
              setLoading(false);
              setError(false);
            }
          }}
          placeholder="Город, адрес или место"
          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          aria-label="Поиск места на карте"
        />
        {query ? (
          <button
            type="button"
            onClick={clear}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-500 hover:text-neutral-900"
            aria-label="Очистить поиск"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {results.length > 0 || error ? (
        <div className="absolute bottom-14 left-0 right-0 overflow-hidden rounded-2xl border border-black/10 bg-white/96 shadow-[0px_14px_34px_rgba(0,0,0,0.16)] backdrop-blur-xl">
          {error ? (
            <p className="px-4 py-3 text-sm text-neutral-600">Поиск временно недоступен</p>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => {
                  onSelect(result);
                  setQuery(result.title);
                  setResults([]);
                  setSearchPaused(true);
                }}
                className="flex w-full items-start gap-3 border-b border-black/6 px-4 py-3 text-left last:border-b-0 hover:bg-black/4"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0000ff]" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-neutral-900">{result.title}</span>
                  {result.subtitle ? (
                    <span className="mt-0.5 block truncate text-xs text-neutral-500">{result.subtitle}</span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
