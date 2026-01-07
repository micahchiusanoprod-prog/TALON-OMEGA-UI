import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Film, Music, Radio, Download } from 'lucide-react';
import { toast } from 'sonner';

const ENTERTAINMENT_ITEMS = [
  {
    id: 'netflix',
    title: 'OMEGA Netflix',
    description: 'Stream your local media collection',
    icon: Film,
    featured: true,
    url: 'http://127.0.0.1:8094',
  },
  {
    id: 'media',
    title: 'Local Media',
    description: 'Browse media library',
    icon: Music,
    url: 'http://127.0.0.1:8095',
  },
  {
    id: 'radio',
    title: 'Radio / SDR',
    description: 'Software-defined radio',
    icon: Radio,
    url: null,
  },
  {
    id: 'downloads',
    title: 'Downloads',
    description: 'Manage downloads',
    icon: Download,
    url: 'http://127.0.0.1:8096',
  },
];

export default function EntertainmentSection() {
  const handleClick = (item) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else {
      toast.info(`${item.title} - Coming soon`);
    }
  };

  const featuredItem = ENTERTAINMENT_ITEMS.find(item => item.featured);
  const otherItems = ENTERTAINMENT_ITEMS.filter(item => !item.featured);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Entertainment</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured: OMEGA Netflix */}
        <Card
          className="lg:col-span-2 glass-strong border-border hover:border-primary transition-smooth cursor-pointer group overflow-hidden"
          onClick={() => handleClick(featuredItem)}
        >
          <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Film className="w-24 h-24 text-primary/40 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-semibold">Open Netflix</span>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">{featuredItem.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{featuredItem.description}</p>
          </CardHeader>
        </Card>

        {/* Other Entertainment Cards */}
        <div className="space-y-4">
          {otherItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="glass border-border hover:border-primary transition-smooth cursor-pointer group"
                onClick={() => handleClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 glass rounded-lg group-hover:glass-strong transition-smooth">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
