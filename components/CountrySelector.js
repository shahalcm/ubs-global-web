import React, { useState, useMemo } from 'react';
import { WORLD_COUNTRIES, POPULAR_COUNTRIES } from '../utils/worldCountries';

export default function CountrySelector({ selectedCountry, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 focus:outline-none"
      >
        <span className="text-lg">{selectedCountry?.flag || '🇮🇳'}</span>
        <span>{selectedCountry?.code || '+91'}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 text-left">
          <input
            type="text"
            placeholder="Search country or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />

          {!search && (
            <div className="mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Popular Countries
              </span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_COUNTRIES.slice(0, 6).map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                  >
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {filteredCountries.map((c) => (
              <button
                key={c.iso}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.flag}</span>
                  <span className="font-medium text-gray-800">{c.name}</span>
                  <span className="text-gray-400">({c.iso})</span>
                </div>
                <span className="font-bold text-gray-600">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
