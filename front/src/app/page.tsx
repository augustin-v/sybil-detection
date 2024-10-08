'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from '@/components/ui/tooltip';
import { CoolMode } from '@/components/ui/cool-mode';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [dangerousHashes, setDangerousHashes] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }

    const storedDangerousHashes = localStorage.getItem('negativeScoreTransaction');
    if (storedDangerousHashes) {
      setDangerousHashes(storedDangerousHashes.split(','));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim() === '') {
      alert("Please enter a transaction hash.");
      return;
    }

    const updatedHistory = Array.from(new Set([searchQuery, ...searchHistory])).slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    router.push(`/results?page=transaction&hash=${encodeURIComponent(searchQuery)}`);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const clearDangerousHashes = () => {
    setDangerousHashes([]);
    localStorage.removeItem('negativeScoreTransaction');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Starknet Sybil Attack Detection Dashboard</h1>
          <p className="text-lg sm:text-xl text-gray-400">Analyze and detect potential Sybil attacks in Starknet blockchain transactions</p>
        </header>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="Enter transaction hash"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
              <CoolMode options={{
                particle: "https://cms-www.coinhouse.com/wp-content/uploads/2024/05/COIN_VIEW_STARKNET_STRK_800x800px_01.webp"
              }}><Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button></CoolMode>
              
            </form>
            
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-300 font-medium">Recent Searches</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <p className='text-gray-400'>No recent searches.</p>
              ) : (
                <ul className="space-y-2">
                  {searchHistory.map((query, index) => (
                    <li
                      key={index}
                      className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors duration-200 truncate"
                      onClick={() => handleHistoryClick(query)}
                    >
                      <Tooltip content={query}>
                        <span className="block w-full overflow-hidden text-ellipsis">{query}</span>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              )}
              {searchHistory.length > 0 && (
                <Button onClick={clearHistory} variant="outline" size="sm" className="mt-4">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-red-900 border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-300 font-medium">Potential Sybil Transactions in recent searches</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              {dangerousHashes.length === 0 ? (
                <p className='text-gray-300'>No dangerous transactions detected.</p>
              ) : (
                <ul className="space-y-2">
                  {dangerousHashes.map((hash, index) => (
                    <li
                      key={index}
                      className="cursor-pointer text-red-400 hover:text-red-300 transition-colors duration-200 truncate"
                      onClick={() => handleHistoryClick(hash)}
                    >
                      <Tooltip content={hash}>
                        <span className="block w-full overflow-hidden text-ellipsis">{hash}</span>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              )}
              {dangerousHashes.length > 0 && (
                <Button onClick={clearDangerousHashes} variant="outline" size="sm" className="mt-4 bg-red-800 hover:bg-red-700 border-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Dangerous Hashes
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}