import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  X, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Send,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../../services/allyApi';

export default function BroadcastModal({ onClose, onSent, savedScrollPosition = 0 }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState('compose'); // 'compose' | 'confirm' | 'success'

  // Lock body scroll when modal opens
  useEffect(() => {
    const scrollY = savedScrollPosition || window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    };
  }, [savedScrollPosition]);

  const handleProceedToConfirm = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setStep('confirm');
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await allyApi.broadcastAlert(title, message, severity);
      
      // Notify parent component
      if (onSent) {
        onSent({ title, message, severity });
      }
      
      if (result.queued) {
        toast.warning('Broadcast queued (offline)', {
          description: 'Will send when connection is restored',
        });
      } else {
        setStep('success');
        toast.success('Emergency broadcast sent!', {
          description: 'All nodes have been notified',
        });
      }
      
      // Auto-close after success
      if (!result.queued) {
        setTimeout(onClose, 2000);
      } else {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to send broadcast');
      setStep('compose');
    } finally {
      setSending(false);
    }
  };

  const getSeverityConfig = (sev) => {
    switch (sev) {
      case 'info':
        return {
          icon: Info,
          color: 'text-primary',
          bg: 'bg-primary-light',
          border: 'border-primary',
          label: 'Information',
          description: 'Non-urgent notice for all nodes',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-warning',
          bg: 'bg-warning-light',
          border: 'border-warning',
          label: 'Warning',
          description: 'Important alert requiring attention',
        };
      case 'emergency':
        return {
          icon: AlertTriangle,
          color: 'text-destructive',
          bg: 'bg-destructive-light',
          border: 'border-destructive',
          label: 'Emergency',
          description: 'Critical alert - immediate action required',
        };
      default:
        return getSeverityConfig('warning');
    }
  };

  const currentSeverity = getSeverityConfig(severity);
  const SeverityIcon = currentSeverity.icon;

  // Success Step
  if (step === 'success') {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        data-testid="broadcast-success"
      >
        <Card className="glass-strong border-border max-w-md w-full p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-success-light mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Broadcast Sent!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your {currentSeverity.label.toLowerCase()} alert has been sent to all family nodes.
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  // Confirmation Step
  if (step === 'confirm') {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && !sending && onClose()}
        data-testid="broadcast-confirm"
      >
        <Card className="glass-strong border-border max-w-lg w-full animate-fade-in">
          <div className="glass-strong border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep('compose')}
                disabled={sending}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-bold text-foreground">Confirm Broadcast</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={sending}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            <div className={`${currentSeverity.bg} border ${currentSeverity.border} rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <SeverityIcon className={`w-6 h-6 ${currentSeverity.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${currentSeverity.color} uppercase mb-1`}>
                    {currentSeverity.label} Alert
                  </div>
                  <div className="text-base font-semibold text-foreground mb-2">{title}</div>
                  <div className="text-sm text-foreground">{message}</div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">This will:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Send to all connected family nodes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Appear pinned at the top of Global Chat
                </li>
                {severity === 'emergency' && (
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Trigger emergency notifications on all devices
                  </li>
                )}
              </ul>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Are you sure you want to send this broadcast?
            </div>
          </div>

          <div className="glass-strong border-t border-border p-4 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setStep('compose')} 
              className="flex-1"
              disabled={sending}
              data-testid="back-btn"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={sending}
              className={`flex-1 ${
                severity === 'emergency' 
                  ? 'bg-destructive hover:bg-destructive/90' 
                  : severity === 'warning'
                    ? 'bg-warning hover:bg-warning/90 text-warning-foreground'
                    : ''
              }`}
              data-testid="confirm-send-btn"
            >
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Send Broadcast
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Compose Step
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="broadcast-modal"
    >
      <Card className="glass-strong border-border max-w-lg w-full animate-fade-in">
        <div className="glass-strong border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold text-foreground">Emergency Broadcast</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-broadcast-btn">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-warning-light border border-warning rounded-lg p-3">
            <p className="text-sm text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
              This will send an alert to all family nodes. Use only for important situations.
            </p>
          </div>

          {/* Severity Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2" data-testid="severity-options">
              {['info', 'warning', 'emergency'].map((sev) => {
                const config = getSeverityConfig(sev);
                const Icon = config.icon;
                const isSelected = severity === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? `${config.bg} ${config.border}` 
                        : 'border-border hover:border-border-strong'
                    }`}
                    data-testid={`severity-${sev}`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? config.color : 'text-muted-foreground'}`} />
                    <div className={`text-xs font-medium ${isSelected ? config.color : 'text-muted-foreground'}`}>
                      {config.label}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{currentSeverity.description}</p>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Broadcast Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Emergency Meeting Point"
              className="w-full"
              data-testid="broadcast-title-input"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide clear instructions or information..."
              className="w-full min-h-[100px]"
              data-testid="broadcast-message-input"
            />
          </div>

          {/* Preview */}
          {(title || message) && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Preview</label>
              <div className={`${currentSeverity.bg} border ${currentSeverity.border} rounded-lg p-3`}>
                <div className="flex items-start gap-2">
                  <SeverityIcon className={`w-4 h-4 ${currentSeverity.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold ${currentSeverity.color} uppercase`}>
                      {title || 'Broadcast Title'}
                    </div>
                    <div className="text-sm text-foreground mt-1">{message || 'Message content...'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-strong border-t border-border p-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="cancel-btn">
            Cancel
          </Button>
          <Button 
            onClick={handleProceedToConfirm} 
            disabled={!title.trim() || !message.trim()}
            className={`flex-1 ${
              severity === 'emergency' 
                ? 'bg-destructive hover:bg-destructive/90' 
                : severity === 'warning'
                  ? 'bg-warning hover:bg-warning/90 text-warning-foreground'
                  : ''
            }`}
            data-testid="next-btn"
          >
            Next: Review
          </Button>
        </div>
      </Card>
    </div>
  );
}
