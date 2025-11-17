'use client';

import { motion } from 'framer-motion';
import { Film, Tv, ChevronDown } from 'lucide-react';

interface DiscoverFiltersProps {
  selectedType: 'FILME' | 'SERIE' | null;
  selectedGenre: string | null;
  genres: string[];
  onTypeChange: (type: 'FILME' | 'SERIE' | null) => void;
  onGenreChange: (genre: string | null) => void;
}

export default function DiscoverFilters({
  selectedType,
  selectedGenre,
  genres,
  onTypeChange,
  onGenreChange
}: DiscoverFiltersProps) {
  return (
    <div className="sticky top-[60px] z-30 bg-gradient-to-b from-black via-black to-black/95 pb-4">
      {/* Type Filters */}
      <div className="flex items-center gap-3 px-4 mb-3">
        {/* Badge Filmes */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onTypeChange(selectedType === 'FILME' ? null : 'FILME')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            selectedType === 'FILME'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Film size={16} />
          Filmes
        </motion.button>

        {/* Badge Séries */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onTypeChange(selectedType === 'SERIE' ? null : 'SERIE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            selectedType === 'SERIE'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <Tv size={16} />
          Séries
        </motion.button>

        {/* Genre Selector */}
        <div className="relative flex-1">
          <select
            value={selectedGenre || ''}
            onChange={(e) => onGenreChange(e.target.value || null)}
            className={`w-full appearance-none pl-4 pr-10 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer ${
              selectedGenre
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          >
            <option value="" className="bg-gray-900 text-white">Todos os Gêneros</option>
            {genres.map((genre) => (
              <option key={genre} value={genre} className="bg-gray-900 text-white">
                {genre}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
              selectedGenre ? 'text-white' : 'text-white/70'
            }`}
          />
        </div>
      </div>

      {/* Active Filters Indicator */}
      {(selectedType || selectedGenre) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4"
        >
          <span className="text-xs text-white/50">Filtros ativos:</span>
          {selectedType && (
            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full">
              {selectedType === 'FILME' ? 'Filmes' : 'Séries'}
            </span>
          )}
          {selectedGenre && (
            <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded-full">
              {selectedGenre}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
