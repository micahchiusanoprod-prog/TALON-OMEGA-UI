import React from 'react';
import { User, CheckCircle, Circle, AlertTriangle, WifiOff, Wifi, Radio, Signal } from 'lucide-react';

const getStatusConfig = (node) => {
  if (node.status === 'offline') {
    return {
      color: 'bg-muted-foreground',
      ringColor: 'ring-muted-foreground/50',
      textColor: 'text-muted-foreground',
      label: 'OFFLINE',
      icon: WifiOff,
    };
  }
  if (node.user_status === 'need_help') {
    return {
      color: 'bg-destructive',
      ringColor: 'ring-destructive/50',
      textColor: 'text-destructive',
      label: 'NEED HELP',
      icon: AlertTriangle,
    };
  }
  if (node.user_status === 'okay') {
    return {
      color: 'bg-warning',
      ringColor: 'ring-warning/50',
      textColor: 'text-warning',
      label: 'OKAY',
      icon: Circle,
    };
  }
  return {
    color: 'bg-success',
    ringColor: 'ring-success/50',
    textColor: 'text-success',
    label: 'GOOD',
    icon: CheckCircle,
  };
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.replace(/['']s?\s+/g, ' ').split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Placeholder avatar images (diverse set)
const placeholderAvatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
];

// Avatar colors based on node ID for consistency (fallback)
const avatarColors = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
  'bg-gradient-to-br from-cyan-500 to-cyan-600',
  'bg-gradient-to-br from-teal-500 to-teal-600',
];

const getAvatarColor = (nodeId) => {
  const hash = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

const getPlaceholderAvatar = (nodeId) => {
  const hash = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return placeholderAvatars[hash % placeholderAvatars.length];
};

// Connection type indicator
const ConnectionIndicator = ({ node }) => {
  if (node.status === 'offline') return null;
  
  const linkType = node.link_type?.toLowerCase();
  let Icon = Wifi;
  let color = 'text-primary';
  
  if (linkType === 'mesh' || linkType === 'lora') {
    Icon = Radio;
    color = 'text-success';
  } else if (linkType === 'lan' || linkType === 'hotspot') {
    Icon = Wifi;
    color = 'text-primary';
  }
  
  // Signal strength indicator
  const rssi = node.rssi;
  let signalBars = 3;
  if (rssi) {
    if (rssi > -50) signalBars = 4;
    else if (rssi > -60) signalBars = 3;
    else if (rssi > -70) signalBars = 2;
    else signalBars = 1;
  }
  
  return (
    <div className="flex items-center gap-1" title={`${node.link_type || 'Unknown'} connection`}>
      <Icon className={`w-3 h-3 ${color}`} />
      <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm ${bar <= signalBars ? color.replace('text-', 'bg-') : 'bg-muted'}`}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default function NodeAvatarStrip({ nodes, onNodeClick, selectedNodeId }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center text-muted-foreground">
        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No nodes found</p>
        <p className="text-xs text-muted-foreground/70">Nodes will appear when they connect to the network</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="node-avatar-strip">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Network</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Tap for details
        </span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin" data-testid="node-avatars">
        {nodes.map((node) => {
          const status = getStatusConfig(node);
          const StatusIcon = status.icon;
          const isSelected = selectedNodeId === node.node_id;
          const hasGps = node.gps && node.gps.lat && node.gps.lon;
          
          return (
            <button
              key={node.node_id}
              onClick={() => onNodeClick(node)}
              className={`flex-shrink-0 relative group transition-all duration-200 ${
                isSelected ? 'scale-105' : 'hover:scale-102'
              }`}
              data-testid={`node-avatar-${node.node_id}`}
            >
              {/* Avatar Card - Larger, Cleaner */}
              <div className={`w-24 glass rounded-xl p-3 flex flex-col items-center gap-2 border-2 transition-all ${
                isSelected 
                  ? `border-primary ${status.ringColor} ring-2` 
                  : 'border-transparent hover:border-primary/30'
              }`}>
                {/* Avatar Circle - Larger */}
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full overflow-hidden ${getAvatarColor(node.node_id)} flex items-center justify-center ring-2 ring-background shadow-lg`}>
                    {node.avatar ? (
                      <img 
                        src={node.avatar} 
                        alt={node.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <img 
                        src={getPlaceholderAvatar(node.node_id)} 
                        alt={node.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    )}
                    <span className="text-white text-lg font-bold hidden items-center justify-center w-full h-full">
                      {getInitials(node.name)}
                    </span>
                  </div>
                  
                  {/* Status Badge - Clear and Visible */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${status.color} border-2 border-background flex items-center justify-center shadow-md`}>
                    <StatusIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                
                {/* Name */}
                <span className="text-xs font-semibold text-foreground truncate w-full text-center">
                  {node.name.split(' ')[0].replace("'s", '')}
                </span>
                
                {/* Connection & GPS Indicators */}
                <div className="flex items-center justify-center gap-2">
                  <ConnectionIndicator node={node} />
                  {hasGps && (
                    <div className="w-2 h-2 rounded-full bg-success" title="GPS Fix" />
                  )}
                </div>
              </div>
              
              {/* Status Label (on hover) */}
              <div className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs font-bold ${status.color} text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10`}>
                {status.label}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Quick Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span>Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-warning" />
          <span>Okay</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span>Need Help</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
}
