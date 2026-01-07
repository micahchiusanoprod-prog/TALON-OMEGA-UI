import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Languages, ListChecks, StickyNote, QrCode, FileText, Wrench } from 'lucide-react';
import { toast } from 'sonner';

const QOL_ITEMS = [
  {
    id: 'translator',
    title: 'Translator',
    description: 'Translate text between languages',
    icon: Languages,
    color: 'text-blue-400',
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Manage your to-do list',
    icon: ListChecks,
    color: 'text-green-400',
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Quick notes & reminders',
    icon: StickyNote,
    color: 'text-yellow-400',
  },
  {
    id: 'qr',
    title: 'Hotspot QR',
    description: 'Share WiFi connection',
    icon: QrCode,
    color: 'text-purple-400',
  },
  {
    id: 'logs',
    title: 'System Logs',
    description: 'View system activity',
    icon: FileText,
    color: 'text-red-400',
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Utilities & settings',
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
              title={item.description}
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
                  <div>
                    <span className="text-sm font-medium text-foreground block">{item.title}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">{item.description}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
