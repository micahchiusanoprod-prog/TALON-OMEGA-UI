import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Languages, ListChecks, StickyNote, QrCode, FileText, Wrench } from 'lucide-react';
import { toast } from 'sonner';

const QOL_ITEMS = [
  {
    id: 'translator',
    title: 'Translator',
    icon: Languages,
    color: 'text-blue-400',
  },
  {
    id: 'tasks',
    title: 'Tasks',
    icon: ListChecks,
    color: 'text-green-400',
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: StickyNote,
    color: 'text-yellow-400',
  },
  {
    id: 'qr',
    title: 'Hotspot QR',
    icon: QrCode,
    color: 'text-purple-400',
  },
  {
    id: 'logs',
    title: 'System Logs',
    icon: FileText,
    color: 'text-red-400',
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: Wrench,
    color: 'text-cyan-400',
  },
];

export default function QualityOfLifeSection({ compact = false }) {
  const handleClick = (item) => {
    toast.info(`${item.title} - Coming soon`);
  };

  if (compact) {
    // Compact minimal version
    return (
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {QOL_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="glass px-4 py-2 rounded-full hover:glass-strong transition-smooth group flex items-center gap-2"
              title={item.title}
            >
              <Icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-sm font-medium text-foreground">{item.title}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Full card version
  return (
    <Card className="glass-strong border-border h-full flex flex-col">
      <CardHeader>
        <CardTitle>Quality of Life</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          {QOL_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="glass p-4 rounded-lg hover:glass-strong transition-smooth group text-left"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 glass rounded-lg group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
