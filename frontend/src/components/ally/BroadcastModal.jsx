import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../../services/allyApi';

export default function BroadcastModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setSending(true);
    try {
      const result = await allyApi.broadcastAlert(title, message, severity);
      
      if (result.queued) {
        toast.warning('Broadcast queued (offline)', {
          description: 'Will send when connection is restored',
        });
      } else {
        toast.success('Emergency broadcast sent', {
          description: 'All nodes have been notified',
        });
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-strong border-border max-w-lg w-full">
        <div className="glass-strong border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold text-foreground">Emergency Broadcast</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-warning-light border border-warning rounded-lg p-3">
            <p className="text-sm text-foreground">
              ⚠️ This will send an alert to all family nodes. Use only for urgent situations.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Broadcast Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Emergency Meeting Point"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide clear instructions or information..."
              className="w-full min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={severity === 'info' ? 'default' : 'outline'}
                onClick={() => setSeverity('info')}
                className="text-xs h-9"
              >
                Info
              </Button>
              <Button
                variant={severity === 'warning' ? 'default' : 'outline'}
                onClick={() => setSeverity('warning')}
                className="text-xs h-9"
              >
                Warning
              </Button>
              <Button
                variant={severity === 'emergency' ? 'default' : 'outline'}
                onClick={() => setSeverity('emergency')}
                className="text-xs h-9 bg-destructive hover:bg-destructive/90"
              >
                Emergency
              </Button>
            </div>
          </div>
        </div>

        <div className="glass-strong border-t border-border p-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !title.trim() || !message.trim()}
            className="flex-1 bg-warning hover:bg-warning/90 text-warning-foreground"
          >
            {sending ? 'Sending...' : 'Send Broadcast'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
