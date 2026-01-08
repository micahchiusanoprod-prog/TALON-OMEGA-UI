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
      <div className="node-glass-panel rounded-2xl p-8 text-center text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-base font-medium">No nodes found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Nodes will appear when they connect to the network</p>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="node-avatar-strip">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold">Network</span>
          <span className="text-sm px-4 py-1.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/20">
            {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          Tap to view details
        </span>
      </div>
      
      {/* Modern glass node cards - LARGER and more premium */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-4 scrollbar-thin" data-testid="node-avatars">
        {nodes.map((node) => {
          const status = getStatusConfig(node);
          const StatusIcon = status.icon;
          const isSelected = selectedNodeId === node.node_id;
          const hasGps = node.gps && node.gps.lat && node.gps.lon;
          
          return (
            <button
              key={node.node_id}
              onClick={() => onNodeClick(node)}
              className={`flex-shrink-0 relative group transition-all duration-300 ${
                isSelected ? 'scale-105' : 'hover:scale-[1.03]'
              }`}
              data-testid={`node-avatar-${node.node_id}`}
            >
              {/* Modern Glass Card - LARGER and more premium */}
              <div className={`w-36 node-glass-panel rounded-3xl p-5 flex flex-col items-center gap-4 transition-all duration-300 ${
                isSelected 
                  ? `border-primary/50 ${status.ringColor} ring-2 shadow-xl shadow-primary/20` 
                  : 'border-white/10 hover:border-primary/30 hover:shadow-lg'
              }`}>
                {/* Avatar Circle - MUCH LARGER for clear visibility */}
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full overflow-hidden ${getAvatarColor(node.node_id)} flex items-center justify-center ring-4 ring-background shadow-2xl`}>
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
                    <span className="text-white text-2xl font-bold hidden items-center justify-center w-full h-full">
                      {getInitials(node.name)}
                    </span>
                  </div>
                  
                  {/* Status Badge - Larger and more prominent */}
                  <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${status.color} border-4 border-background flex items-center justify-center shadow-lg`}>
                    <StatusIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* Name - Larger text */}
                <span className="text-base font-bold text-foreground truncate w-full text-center">
                  {node.name.split(' ')[0].replace("'s", '')}
                </span>
                
                {/* Connection & GPS Indicators - Better spacing */}
                <div className="flex items-center justify-center gap-3">
                  <ConnectionIndicator node={node} />
                  {hasGps && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-success shadow-sm shadow-success/50" />
                      <span className="text-xs text-success font-semibold">GPS</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Label - Floating pill above card */}
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold ${status.color} text-white shadow-lg z-10`}>
                {status.label}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Quick Legend - Updated styling */}
      <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-success shadow-sm shadow-success/50" />
          <span>Good</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-warning shadow-sm shadow-warning/50" />
          <span>Okay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive shadow-sm shadow-destructive/50" />
          <span>Need Help</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
}
