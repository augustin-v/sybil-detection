'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const router = useRouter();

  // Load search history from localStorage when the component mounts
  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim() === '') {
      alert("Please enter a transaction hash.");
      return;
    }

    // Update search history and store in localStorage
    const updatedHistory = Array.from(new Set([searchQuery, ...searchHistory])).slice(0, 5);

    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    // Redirect to the results page
    router.push(`/results?page=transaction&hash=${encodeURIComponent(searchQuery)}`);
  };

  // Handle when a user clicks a history item to auto-fill the input
  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Sybil Attack Detection Dashboard</h1>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search transaction hash"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
          required
        />
        <Button type="submit">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Display the search history */}
      <div>
        <Card>
          <CardContent>
            <h2 className="font-bold mb-4">Search History</h2>
            {searchHistory.length === 0 ? (
              <p>No recent searches.</p>
            ) : (
              <ul className="space-y-2">
                {searchHistory.map((query, index) => (
                  <li
                    key={index}
                    className="cursor-pointer text-blue-500 hover:underline"
                    onClick={() => handleHistoryClick(query)}
                  >
                    {query}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
