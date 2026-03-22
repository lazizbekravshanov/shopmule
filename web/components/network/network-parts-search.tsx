'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NetworkResult {
  id: string;
  partName: string;
  partNumber: string | null;
  availableQty: number;
  askingPrice: number;
  notes: string | null;
  shopName: string;
  city: string | null;
  state: string | null;
  distanceMiles: number | null;
  createdAt: string;
}

export function NetworkPartsSearch() {
  const [keyword, setKeyword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery<{ results: NetworkResult[] }>({
    queryKey: ['network-search', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ keyword: searchTerm, maxDistance: '50' });
      const res = await fetch(`/api/network/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: searchTerm.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(keyword.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search network parts (e.g., brake pads, water pump)..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={!keyword.trim() || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {!searchTerm && (
        <div className="text-center py-8 text-neutral-400">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Search for parts available from nearby shops on the network</p>
        </div>
      )}

      {data?.results && data.results.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <p className="text-sm">No parts found within 50 miles. Try a broader search.</p>
        </div>
      )}

      {data?.results && data.results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.results.map((result) => (
            <div
              key={result.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                    {result.partName}
                  </div>
                  {result.partNumber && (
                    <div className="text-xs text-neutral-500 font-mono">{result.partNumber}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    ${result.askingPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-500">Qty: {result.availableQty}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="font-medium">{result.shopName}</span>
                {result.city && result.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {result.city}, {result.state}
                  </span>
                )}
                {result.distanceMiles !== null && (
                  <span className="text-[#ee7a14] font-medium">{result.distanceMiles} mi</span>
                )}
              </div>

              {result.notes && (
                <p className="text-xs text-neutral-400 mt-2">{result.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
