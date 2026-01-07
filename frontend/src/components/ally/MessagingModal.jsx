import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../../services/allyApi';
import config from '../../config';

export default function MessagingModal({ type, nodeId, nodeName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, config.polling.allyChat);
    return () => clearInterval(interval);
  }, [type, nodeId]);

  const fetchMessages = async () => {
    try {
      const data = type === 'group' 
        ? await allyApi.getGlobalChat()
        : await allyApi.getDM(nodeId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const result = type === 'group'
        ? await allyApi.sendGlobalMessage(newMessage, urgent ? 'urgent' : 'normal')
        : await allyApi.sendDM(nodeId, newMessage, urgent);
      
      if (result.queued) {
        toast.info('Message queued (offline)');
      } else {
        toast.success('Message sent');
      }
      
      setNewMessage('');
      setUrgent(false);
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const emergencyBroadcasts = messages.filter(m => m.priority === 'emergency');
  const regularMessages = messages.filter(m => m.priority !== 'emergency');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-strong border-border max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="glass-strong border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {type === 'group' ? 'Group Chat' : `Direct Message: ${nodeName}`}
            </h2>
            <p className="text-xs text-muted-foreground">
              {type === 'group' ? 'All family nodes' : nodeId}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Emergency Broadcasts */}
        {emergencyBroadcasts.length > 0 && (
          <div className="p-4 border-b border-border space-y-2">
            {emergencyBroadcasts.map((msg) => (
              <div key={msg.id} className="bg-destructive-light border-2 border-destructive p-3 rounded-lg animate-critical-flash">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5 animate-critical-glow" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-destructive">{msg.broadcast_title || 'EMERGENCY BROADCAST'}</div>
                    <div className="text-sm text-foreground mt-1">{msg.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {msg.sender_name} • {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : regularMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            regularMessages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMe ? 'bg-primary text-primary-foreground' : 'glass'} p-3 rounded-lg`}>
                    {!isMe && type === 'group' && (
                      <div className="text-xs font-semibold mb-1">{msg.sender_name}</div>
                    )}
                    <div className="text-sm">{msg.text}</div>
                    <div className={`text-xs mt-1 flex items-center gap-2 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.status && <span>• {msg.status}</span>}
                      {msg.priority === 'urgent' && (
                        <span className="text-warning">• URGENT</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compose */}
        <div className="glass-strong border-t border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-warning font-medium">Mark as Urgent</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
