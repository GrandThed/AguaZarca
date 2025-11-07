'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface PropertySearchProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function PropertySearch({
  initialValue = '',
  onSearch,
  placeholder = 'Buscar propiedades...',
}: PropertySearchProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}