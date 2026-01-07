import React from 'react';
import { User, CheckCircle, Circle, AlertTriangle, WifiOff } from 'lucide-react';

const getStatusConfig = (node) => {
  if (node.status === 'offline') {
    return {
      color: 'bg-muted-foreground',
      textColor: 'text-muted-foreground',
      label: 'OFF',
      icon: WifiOff,
    };
  }
  if (node.user_status === 'need_help') {
    return {
      color: 'bg-destructive',
      textColor: 'text-destructive',
      label: 'HELP',
      icon: AlertTriangle,
    };
  }
  if (node.user_status === 'okay') {
    return {
      color: 'bg-warning',
      textColor: 'text-warning',
      label: 'OKAY',
      icon: Circle,
    };
  }
  return {
    color: 'bg-success',
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

// Avatar colors based on node ID for consistency
const avatarColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-teal-500',
];

const getAvatarColor = (nodeId) => {
  const hash = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

export default function NodeAvatarStrip({ nodes, onNodeClick, selectedNodeId }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="glass rounded-lg p-4 text-center text-muted-foreground text-sm">
        <User className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p>No nodes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="node-avatar-strip">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Network ({nodes.length})
        </span>
        <span className="text-xs text-muted-foreground">
          Click to view details
        </span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin" data-testid="node-avatars">
        {nodes.map((node) => {
          const status = getStatusConfig(node);
          const StatusIcon = status.icon;
          const isSelected = selectedNodeId === node.node_id;
          
          return (
            <button
              key={node.node_id}
              onClick={() => onNodeClick(node)}
              className={`flex-shrink-0 relative group transition-all ${
                isSelected ? 'scale-105' : 'hover:scale-105'
              }`}
              data-testid={`node-avatar-${node.node_id}`}
              title={`${node.name} - ${status.label}`}
            >
              {/* Avatar Card */}
              <div className={`w-16 h-20 glass rounded-lg flex flex-col items-center justify-center gap-1 border-2 transition-colors ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-transparent hover:border-primary/50'
              }`}>
                {/* Avatar Circle */}
                <div className={`relative w-10 h-10 rounded-full ${getAvatarColor(node.node_id)} flex items-center justify-center`}>
                  {node.avatar ? (
                    <img 
                      src={node.avatar} 
                      alt={node.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {getInitials(node.name)}
                    </span>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${status.color} border-2 border-background flex items-center justify-center`}>
                    <StatusIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                
                {/* Name */}
                <span className="text-xs font-medium text-foreground truncate w-14 text-center">
                  {node.name.split(' ')[0].replace("'s", '')}
                </span>
              </div>
              
              {/* Status Pill (on hover) */}
              <div className={`absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-xs font-bold ${status.color} text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                {status.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
