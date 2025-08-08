import React, { useState, useEffect } from "react";
import { ExternalLink, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  source: string;
  url: string;
}

const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "Major Breakthrough in Quantum Computing Achieved",
    summary:
      "Scientists have successfully demonstrated quantum supremacy in a new application that could revolutionize encryption and data processing.",
    category: "Technology",
    timestamp: "2 hours ago",
    source: "Tech Weekly",
    url: "https://example.com/quantum-breakthrough",
  },
  {
    id: 2,
    title: "Global Climate Summit Reaches Historic Agreement",
    summary:
      "World leaders have signed a comprehensive climate action plan with binding commitments to reduce carbon emissions by 50% within the next decade.",
    category: "Environment",
    timestamp: "4 hours ago",
    source: "Global News",
    url: "https://example.com/climate-summit",
  },
  {
    id: 3,
    title: "New Privacy Regulations Impact Tech Giants",
    summary:
      "Stricter data protection laws are being implemented globally, requiring major technology companies to overhaul their data collection practices.",
    category: "Privacy",
    timestamp: "6 hours ago",
    source: "Privacy Today",
    url: "https://example.com/privacy-regulations",
  },
  {
    id: 4,
    title: "Breakthrough in Renewable Energy Storage",
    summary:
      "A new battery technology promises to store renewable energy for weeks, potentially solving the intermittency problem of solar and wind power.",
    category: "Energy",
    timestamp: "8 hours ago",
    source: "Energy Report",
    url: "https://example.com/renewable-storage",
  },
  {
    id: 5,
    title: "AI-Powered Medical Diagnosis Shows Promise",
    summary:
      "Machine learning algorithms are now able to detect certain diseases earlier and more accurately than traditional diagnostic methods.",
    category: "Health",
    timestamp: "10 hours ago",
    source: "Medical Journal",
    url: "https://example.com/ai-diagnosis",
  },
  {
    id: 6,
    title: "Space Mission Discovers Potential Signs of Life",
    summary:
      "NASA's latest probe has detected unusual chemical signatures on a distant moon that could indicate the presence of microbial life.",
    category: "Space",
    timestamp: "12 hours ago",
    source: "Space News",
    url: "https://example.com/space-life",
  },
];

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-500",
  Environment: "bg-green-500",
  Privacy: "bg-purple-500",
  Energy: "bg-yellow-500",
  Health: "bg-red-500",
  Space: "bg-indigo-500",
};

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [loading, setLoading] = useState(false);

  const refreshNews = () => {
    setLoading(true);
    // Simulate news refresh
    setTimeout(() => {
      const shuffled = [...mockNews].sort(() => Math.random() - 0.5);
      setNews(shuffled);
      setLoading(false);
    }, 1000);
  };

  const handleNewsClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Latest News</h2>
        <button
          onClick={refreshNews}
          disabled={loading}
          className="px-4 py-2 bg-kruger-primary text-white rounded-lg hover:bg-kruger-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 glass-strong"
            onClick={() => handleNewsClick(item.url)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  className={`${categoryColors[item.category]} text-white`}
                  variant="default"
                >
                  {item.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.timestamp}
                </div>
              </div>
              <CardTitle className="text-lg leading-tight hover:text-kruger-primary transition-colors">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                {item.summary}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {item.source}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => window.open("https://news.google.com", "_blank")}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          View More News
        </button>
      </div>
    </div>
  );
}
