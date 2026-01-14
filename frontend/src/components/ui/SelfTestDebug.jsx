import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, CheckCircle, XCircle, AlertTriangle, Info, Clock, Download, Copy, Loader2, Shield, Lock, Unlock } from 'lucide-react';
import { useEvidence } from '../../contexts/EvidenceContext';
import { STATUS_EXPLANATIONS } from './ProgressiveDisclosure';

// Self-Test Runner Component
export const SelfTestRunner = ({ compact = false, onClose }) => {
  const { selfTestResults, runSelfTest, connectionState } = useEvidence();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const handleRunTest = async () => {
    setIsRunning(true);
    setError(null);
    try {
      await runSelfTest();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status) => {
    const config = STATUS_EXPLANATIONS[status] || STATUS_EXPLANATIONS.UNKNOWN;
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.color}`} />;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleString();
  };

  if (compact) {
    return (
      <button
        onClick={handleRunTest}
        disabled={isRunning}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        data-testid="self-test-btn-compact"
      >
        {isRunning ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        Run Self-Test
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4" data-testid="self-test-runner">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">System Self-Test</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Run Button */}
      <button
        onClick={handleRunTest}
        disabled={isRunning}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        data-testid="self-test-run-btn"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Tests...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Self-Test
          </>
        )}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          Error: {error}
        </div>
      )}

      {/* Results */}
      {selfTestResults && (
        <div className="space-y-3">
          {/* Overall Status */}
          <div className={`p-3 rounded-lg border ${STATUS_EXPLANATIONS[selfTestResults.overall]?.borderColor || 'border-border'} ${STATUS_EXPLANATIONS[selfTestResults.overall]?.bgColor || 'bg-secondary/20'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(selfTestResults.overall)}
                <span className="font-medium">Overall Status</span>
              </div>
              <span className={`text-sm font-medium ${STATUS_EXPLANATIONS[selfTestResults.overall]?.color || 'text-muted-foreground'}`}>
                {selfTestResults.overall}
              </span>
            </div>
          </div>

          {/* Last Run Time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Last run: {formatTimestamp(selfTestResults.timestamp)}
          </div>

          {/* Individual Tests */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Subsystem Tests:</div>
            {selfTestResults.tests?.map((test, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-sm"
                data-testid={`self-test-result-${test.subsystem?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <span>{test.subsystem}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {test.latency !== null && (
                    <span className="text-xs">{test.latency}ms</span>
                  )}
                  <span className={`text-xs font-medium ${STATUS_EXPLANATIONS[test.status]?.color}`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selfTestResults && !isRunning && (
        <div className="text-center text-sm text-muted-foreground p-4">
          No test results yet. Click "Run Self-Test" to check system status.
        </div>
      )}
    </div>
  );
};

// Debug Bundle Component
export const DebugBundlePanel = ({ onClose }) => {
  const { generateDebugBundle, copyDebugBundle, selfTestResults } = useEvidence();
  const [copied, setCopied] = useState(false);
  const [bundlePreview, setBundlePreview] = useState(null);
  const [redactSensitive, setRedactSensitive] = useState(true);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  const handleCopy = async () => {
    const result = await copyDebugBundle();
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    const bundle = generateDebugBundle();
    if (redactSensitive) {
      // Redact sensitive values
      const redacted = JSON.parse(JSON.stringify(bundle));
      if (redacted.configSnapshot) {
        redacted.configSnapshot = {
          ...redacted.configSnapshot,
          backendUrl: redacted.configSnapshot.backendUrl ? '[REDACTED]' : 'not_set'
        };
      }
      if (redacted.profile?.displayName) {
        redacted.profile.displayName = '[REDACTED]';
      }
      setBundlePreview(JSON.stringify(redacted, null, 2));
    } else {
      setBundlePreview(JSON.stringify(bundle, null, 2));
    }
  };

  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    try {
      const bundle = generateDebugBundle();
      
      // Apply redaction if enabled
      let exportBundle = bundle;
      if (redactSensitive) {
        exportBundle = JSON.parse(JSON.stringify(bundle));
        if (exportBundle.configSnapshot) {
          exportBundle.configSnapshot.backendUrl = '[REDACTED]';
        }
        if (exportBundle.profile?.displayName) {
          exportBundle.profile.displayName = '[REDACTED]';
        }
      }
      
      // Create files for the ZIP
      const files = {
        'debug_bundle.json': JSON.stringify(exportBundle, null, 2),
        'BUILD_INFO.json': JSON.stringify(exportBundle.buildInfo, null, 2),
        'CONFIG_SNAPSHOT.json': JSON.stringify(exportBundle.configSnapshot, null, 2),
        'SELF_TEST_RESULTS.json': JSON.stringify(exportBundle.selfTestResults, null, 2),
        'NETWORK_LOG.json': JSON.stringify(exportBundle.networkLog, null, 2),
        'ERROR_LOG.json': JSON.stringify(exportBundle.errorLog, null, 2),
        'CONNECTION_STATE.json': JSON.stringify(exportBundle.connectionState, null, 2),
        'README.txt': `OMEGA Dashboard Debug Bundle
Generated: ${exportBundle.generatedAt}
Version: ${exportBundle.buildInfo?.version || 'unknown'}

Contents:
- debug_bundle.json: Complete bundle
- BUILD_INFO.json: Build information
- CONFIG_SNAPSHOT.json: Configuration snapshot
- SELF_TEST_RESULTS.json: Last self-test results
- NETWORK_LOG.json: Last 100 network requests
- ERROR_LOG.json: Last 100 UI errors
- CONNECTION_STATE.json: Current connection state

${redactSensitive ? 'NOTE: Sensitive values have been redacted.' : 'WARNING: Contains unredacted sensitive values.'}
`
      };
      
      // Use JSZip if available, otherwise fall back to data URL
      try {
        // Dynamic import JSZip
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        Object.entries(files).forEach(([name, content]) => {
          zip.file(name, content);
        });
        
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omega_debug_bundle_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (zipError) {
        // Fallback: Download JSON only
        const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omega_debug_bundle_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to generate debug bundle:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4" data-testid="debug-bundle-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Debug Bundle</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Generate a debug bundle containing system info, test results, and logs for troubleshooting.
      </p>

      {/* Bundle Contents */}
      <div className="mb-4 p-3 bg-secondary/30 rounded-lg text-sm">
        <div className="font-medium text-foreground mb-2">Bundle Contents:</div>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            BUILD_INFO (version, date, environment)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            CONFIG_SNAPSHOT (backend URL, theme, language)
          </li>
          <li className="flex items-center gap-2">
            {selfTestResults ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            )}
            Self-test results {!selfTestResults && '(not run yet)'}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Last 100 network requests
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Last 100 UI errors
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Connection state summary
          </li>
        </ul>
      </div>

      {/* Redaction Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={redactSensitive}
            onChange={(e) => setRedactSensitive(e.target.checked)}
            className="rounded border-border"
            data-testid="redact-toggle"
          />
          <span className="text-sm text-foreground">Redact sensitive values</span>
        </label>
        <span className="text-xs text-muted-foreground">(PINs, URLs, names)</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          data-testid="debug-bundle-copy-btn"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy JSON
            </>
          )}
        </button>
        <button
          onClick={handleDownloadZip}
          disabled={isGeneratingZip}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          data-testid="debug-bundle-zip-btn"
        >
          {isGeneratingZip ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download ZIP
            </>
          )}
        </button>
        <button
          onClick={handlePreview}
          className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
          data-testid="debug-bundle-preview-btn"
        >
          Preview
        </button>
      </div>

      {/* Preview Modal */}
      {bundlePreview && (
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg max-h-64 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Bundle Preview</span>
            <button 
              onClick={() => setBundlePreview(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{bundlePreview}</pre>
        </div>
      )}
    </div>
  );
};
            {selfTestResults ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            )}
            Self-test results {!selfTestResults && '(not run yet)'}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Last 100 network requests
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Last 100 UI errors
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Connection state summary
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          data-testid="debug-bundle-copy-btn"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy JSON Bundle
            </>
          )}
        </button>
        <button
          onClick={handlePreview}
          className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
          data-testid="debug-bundle-preview-btn"
        >
          Preview
        </button>
      </div>

      {/* ZIP Download - PLANNED */}
      <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
        <div className="flex items-center gap-1 text-amber-500">
          <AlertTriangle className="w-3 h-3" />
          <span className="font-medium">ZIP download: PLANNED</span>
        </div>
        <span className="text-muted-foreground">Use "Copy JSON Bundle" for now.</span>
      </div>

      {/* Preview Modal */}
      {bundlePreview && (
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg max-h-64 overflow-auto">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{bundlePreview}</pre>
        </div>
      )}
    </div>
  );
};

// PIN Entry Modal Component
export const PinEntryModal = ({ isOpen, onClose, onSuccess, title = 'Admin PIN Required' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    const success = onSuccess(pin);
    if (!success) {
      setError('Invalid PIN');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-testid="pin-entry-modal">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-full">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Enter your admin PIN to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            placeholder="Enter PIN"
            className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
            autoFocus
            data-testid="pin-input"
          />

          {error && (
            <div className="mb-3 text-sm text-red-500 text-center">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="pin-submit-btn"
            >
              Unlock
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Default PIN: 1234 (change in Admin Console)
        </p>
      </div>
    </div>
  );
};

// Admin Gate Component - Wraps content that requires admin access
export const AdminGate = ({ 
  children, 
  fallback = null,
  requirePin = true,
  showLockUI = true 
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Import auth context dynamically to avoid circular deps
  const { useAuth } = require('../../contexts/AuthContext');
  const { isAdminUnlocked, hasRole, ROLES, verifyPin, getUnlockStatus } = useAuth();

  const status = getUnlockStatus();

  if (!status.locked) {
    return children;
  }

  if (!showLockUI) {
    return fallback;
  }

  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl" data-testid="admin-gate">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-amber-500/20 rounded-full">
          <Lock className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Admin Access Required</h4>
          <p className="text-sm text-muted-foreground">{status.message}</p>
        </div>
      </div>

      {status.reason === 'ROLE_REQUIRED' && (
        <p className="text-sm text-muted-foreground mb-3">
          You need admin privileges to access this feature. Current role: <strong>{hasRole(ROLES.ADMIN) ? 'admin' : hasRole(ROLES.MEMBER) ? 'member' : 'guest'}</strong>
        </p>
      )}

      {status.reason === 'PIN_REQUIRED' && (
        <button
          onClick={() => setShowPinModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          data-testid="admin-unlock-btn"
        >
          <Unlock className="w-4 h-4" />
          Enter PIN to Unlock
        </button>
      )}

      <PinEntryModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={(pin) => {
          const success = verifyPin(pin);
          if (success) {
            setShowPinModal(false);
          }
          return success;
        }}
      />
    </div>
  );
};

export default {
  SelfTestRunner,
  DebugBundlePanel,
  PinEntryModal,
  AdminGate
};
