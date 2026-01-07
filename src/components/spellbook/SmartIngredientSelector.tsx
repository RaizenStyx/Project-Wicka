'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DatabaseItem } from '@/app/types/database';

interface SmartIngredientSelectorProps {
  // Updated to include 'runes' and 'essential_oils'
  tableName: 'crystals' | 'herbs' | 'deities' | 'candles' | 'runes' | 'essential_oils';
  label: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function SmartIngredientSelector({
  tableName,
  label,
  selectedIds,
  onSelectionChange,
}: SmartIngredientSelectorProps) {
  const supabase = createClient();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DatabaseItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<DatabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch details of already selected IDs
  useEffect(() => {
    const fetchSelectedDetails = async () => {
      if (selectedIds.length === 0) {
          setSelectedItems([]); // Clear items if IDs are empty
          return;
      }
      
      const { data } = await supabase
        .from(tableName)
        .select('id, name') 
        .in('id', selectedIds);
        
      if (data) setSelectedItems(data);
    };
    
    fetchSelectedDetails();
  }, [selectedIds, tableName]); // Depend on tableName too

  // 2. Search Database
  useEffect(() => {
    const searchDB = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const { data } = await supabase
        .from(tableName)
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (data) setResults(data);
      setIsLoading(false);
    };

    const timer = setTimeout(searchDB, 300);
    return () => clearTimeout(timer);
  }, [query, tableName]);

  // 3. Handlers
  const handleSelect = (item: DatabaseItem) => {
    if (selectedIds.includes(item.id)) return;
    
    const newIds = [...selectedIds, item.id];
    // Optimistically update selectedItems
    const newItems = [...selectedItems, item];
    
    onSelectionChange(newIds);
    setSelectedItems(newItems);
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (idToRemove: string) => {
    const newIds = selectedIds.filter(id => id !== idToRemove);
    const newItems = selectedItems.filter(item => item.id !== idToRemove);
    
    onSelectionChange(newIds);
    setSelectedItems(newItems);
  };

  return (
    <div className="w-full mb-4" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>

      {/* Selected Tags Area */}
      <div className="flex flex-wrap gap-2 mb-2">
        <AnimatePresence>
          {selectedItems.map((item) => (
            <motion.span
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900/50 border border-purple-500 text-purple-100"
            >
              {item.name}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="ml-2 hover:text-red-400 focus:outline-none"
              >
                <X size={14} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            className={twMerge(
              "w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500",
              isOpen ? "rounded-b-none border-b-0" : ""
            )}
            placeholder={`Search ${tableName}...`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
        </div>

        {/* Dropdown Results */}
        <AnimatePresence>
          {isOpen && query.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full bg-slate-800 border border-slate-700 rounded-b-md shadow-xl max-h-60 overflow-y-auto"
            >
              {isLoading ? (
                <div className="p-4 text-center text-slate-400 flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Searching...
                </div>
              ) : results.length > 0 ? (
                <ul>
                  {results.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <li
                        key={item.id}
                        onClick={() => !isSelected && handleSelect(item)}
                        className={clsx(
                          "px-4 py-2 cursor-pointer flex justify-between items-center transition-colors",
                          isSelected 
                            ? "bg-purple-900/30 text-purple-300 cursor-default" 
                            : "hover:bg-slate-700 text-slate-200"
                        )}
                      >
                        <span>{item.name}</span>
                        {isSelected && <Check size={16} />}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No {tableName} found.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}