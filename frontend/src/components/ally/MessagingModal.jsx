import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  X, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Zap,
  Pin,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../../services/allyApi';
import config from '../../config';

export default function MessagingModal({ type, nodeId, nodeName, onClose, savedScrollPosition = 0 }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesContainerRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const scrollPositionRef = useRef(savedScrollPosition);
  const templates = allyApi.getMessageTemplates();

  // Lock body scroll when modal opens to prevent page jumping
  useEffect(() => {
    // Use the saved position passed from parent, or current if not provided
    const scrollY = savedScrollPosition || window.scrollY;
    scrollPositionRef.current = scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll'; // Prevent layout shift
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [savedScrollPosition]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, config.polling.allyChat);
    return () => clearInterval(interval);
  }, [type, nodeId]);

  // Smart auto-scroll for modal chat
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    const newMessageCount = messages.length;
    const hadNewMessages = newMessageCount > prevMessageCountRef.current;
    
    // Skip initial load - don't auto-scroll when modal first opens
    if (prevMessageCountRef.current === 0 && newMessageCount > 0) {
      prevMessageCountRef.current = newMessageCount;
      // Scroll to bottom on initial load without animation
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 0);
      return;
    }
    
    prevMessageCountRef.current = newMessageCount;
    
    if (shouldAutoScroll) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setShouldAutoScroll(false);
      setHasNewMessages(false);
      return;
    }
    
    if (hadNewMessages && isNearBottom) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setHasNewMessages(false);
    } else if (hadNewMessages && !isNearBottom) {
      setHasNewMessages(true);
    }
  }, [messages, shouldAutoScroll, isNearBottom]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distanceFromBottom < 50);
    if (distanceFromBottom < 50) {
      setHasNewMessages(false);
    }
  };

  const handleJumpToLatest = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setHasNewMessages(false);
      setIsNearBottom(true);
    }
  };

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
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - add message immediately with 'sending' status
    const optimisticMsg = {
      id: tempId,
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sending',
      priority: urgent ? 'urgent' : 'normal',
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setShouldAutoScroll(true); // Scroll to show sent message
    
    const msgText = newMessage;
    const isUrgent = urgent;
    setNewMessage('');
    setUrgent(false);

    try {
      const result = type === 'group'
        ? await allyApi.sendGlobalMessage(msgText, isUrgent ? 'urgent' : 'normal')
        : await allyApi.sendDM(nodeId, msgText, isUrgent);
      
      // Update message status based on result
      setMessages(prev => prev.map(m => 
        m.id === tempId 
          ? { ...m, status: result.queued ? 'queued' : 'sent' }
          : m
      ));
      
      if (result.queued) {
        toast.info('Message queued (will send when online)', {
          description: 'The message will be sent automatically when connection is restored.',
        });
      }
    } catch (error) {
      // Update message status to failed
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'failed' } : m
      ));
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTemplateClick = (template) => {
    setNewMessage(template.text);
  };

  const handleRetry = async (msg) => {
    // Remove failed message and re-send
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    setNewMessage(msg.text);
    if (msg.priority === 'urgent') setUrgent(true);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-success" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-muted-foreground" />;
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />;
      case 'queued':
        return <Clock className="w-3 h-3 text-warning" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'sent': return 'Sent';
      case 'sending': return 'Sending...';
      case 'queued': return 'Queued';
      case 'failed': return 'Failed';
      default: return '';
    }
  };

  const emergencyBroadcasts = messages.filter(m => m.priority === 'emergency' || m.broadcast_severity === 'emergency');
  const regularMessages = messages.filter(m => m.priority !== 'emergency' && m.broadcast_severity !== 'emergency');

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="messaging-modal"
    >
      <Card className="glass-strong border-border max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="glass-strong border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {type === 'group' ? 'Group Chat' : `Message: ${nodeName || nodeId}`}
            </h2>
            <p className="text-xs text-muted-foreground">
              {type === 'group' ? 'All family nodes' : `Direct conversation with ${nodeId}`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-modal-btn">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Pinned Emergency Broadcasts */}
        {emergencyBroadcasts.length > 0 && (
          <div className="p-3 border-b border-border space-y-2 bg-destructive-light/30" data-testid="emergency-broadcasts">
            {emergencyBroadcasts.map((msg) => (
              <div key={msg.id} className="bg-destructive-light border border-destructive rounded-lg p-3 animate-critical-flash">
                <div className="flex items-start gap-2">
                  <Pin className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
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
        <div className="flex-1 overflow-hidden relative min-h-[200px]">
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto p-4 space-y-3 scrollbar-thin" 
            data-testid="message-list"
          >
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : regularMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            <>
              {regularMessages.map((msg) => {
                const isMe = msg.sender === 'me';
                const isBroadcast = msg.sender === 'broadcast';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div className={`max-w-[75%] ${
                      isBroadcast 
                        ? 'bg-warning-light border border-warning' 
                        : isMe 
                          ? 'bg-primary text-primary-foreground' 
                          : 'glass'
                    } p-3 rounded-lg ${msg.status === 'failed' ? 'opacity-60' : ''}`}>
                      {!isMe && type === 'group' && !isBroadcast && (
                        <div className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                          {msg.sender_name}
                          {msg.sender_status && (
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              msg.sender_status === 'need_help' ? 'bg-destructive-light text-destructive' :
                              msg.sender_status === 'okay' ? 'bg-warning-light text-warning' :
                              'bg-success-light text-success'
                            }`}>
                              {msg.sender_status === 'need_help' ? 'HELP' : msg.sender_status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      {isBroadcast && (
                        <div className="text-xs font-bold text-warning mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {msg.broadcast_title || 'BROADCAST'}
                        </div>
                      )}
                      <div className="text-sm">{msg.text}</div>
                      <div className={`text-xs mt-1.5 flex items-center gap-2 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        <span>{formatTime(msg.timestamp)}</span>
                        {isMe && msg.status && (
                          <span className="flex items-center gap-1">
                            {getStatusIcon(msg.status)}
                            <span className={msg.status === 'failed' ? 'text-destructive' : msg.status === 'queued' ? 'text-warning' : ''}>
                              {getStatusLabel(msg.status)}
                            </span>
                          </span>
                        )}
                        {msg.priority === 'urgent' && (
                          <span className="flex items-center gap-0.5 text-warning font-medium">
                            <Zap className="w-3 h-3" />
                            URGENT
                          </span>
                        )}
                      </div>
                      {msg.status === 'failed' && isMe && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetry(msg)}
                          className="mt-2 h-6 text-xs text-destructive hover:text-destructive"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Tap to retry
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          </div>
          
          {/* Jump to Latest Button */}
          {hasNewMessages && !isNearBottom && (
            <button
              onClick={handleJumpToLatest}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:bg-primary-hover transition-colors flex items-center gap-1 z-10"
              data-testid="jump-to-latest-btn"
            >
              <ChevronDown className="w-3 h-3" />
              New messages
            </button>
          )}
        </div>

        {/* Quick Templates */}
        <div className="border-t border-border px-4 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1" data-testid="quick-templates">
            {templates.map((template) => (
              <Button
                key={template.id}
                size="sm"
                variant="outline"
                onClick={() => handleTemplateClick(template)}
                className="h-7 text-xs whitespace-nowrap flex-shrink-0 border-border-strong"
                data-testid={`template-${template.id}`}
              >
                <span className="mr-1">{template.icon}</span>
                {template.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Compose */}
        <div className="glass-strong border-t border-border p-4 space-y-3">
          {/* Urgent Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none" data-testid="urgent-toggle">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${urgent ? 'bg-warning' : 'bg-muted'}`}>
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="sr-only"
                />
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${urgent ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className={`text-xs font-medium ${urgent ? 'text-warning' : 'text-muted-foreground'}`}>
                <Zap className="w-3 h-3 inline mr-1" />
                Mark as Urgent
              </span>
            </label>
            {urgent && (
              <span className="text-xs text-warning">Recipients will be notified immediately</span>
            )}
          </div>
          
          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
              data-testid="message-input"
            />
            <Button 
              onClick={handleSend} 
              disabled={!newMessage.trim() || sending}
              className={urgent ? 'bg-warning hover:bg-warning/90 text-warning-foreground' : ''}
              data-testid="send-btn"
            >
              {sending ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
