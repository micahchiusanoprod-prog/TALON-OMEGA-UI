import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Users,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile,
  BarChart3,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  HelpCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  RefreshCw,
  Filter,
  User,
  Battery,
  MapPin,
  Radio,
  Zap,
  FileText
} from 'lucide-react';
import { Input } from './ui/input';
import TileHelpTabs, { QuickHelpTips } from './ui/TileHelpTabs';

// Help content for Community tile
const communityHelpContent = {
  whatItDoes: "Stay connected with your network through an offline-first social feed. Share updates, create polls, and react to posts. Works without internet - syncs when connections are available.",
  quickStart: [
    "View posts from your network in the feed",
    "Tap reactions (👍❤️😮) to respond to posts",
    "Expand comments to see discussions",
    "Create a new post or poll with the + button",
    "Filter posts by type (All, Alerts, Polls)"
  ],
  controls: [
    { name: "Post Types", description: "Regular posts, alerts (urgent), polls" },
    { name: "Reactions", description: "Quick emoji responses without typing" },
    { name: "Comments", description: "Expand post to view/add comments" },
    { name: "Sync Status", description: "Shows if posts are synced or pending" },
  ],
  bestPractices: [
    "Use alerts sparingly - only for urgent/emergency messages",
    "Keep posts brief for faster mesh sync",
    "Polls auto-close after 24 hours by default",
    "Old posts are archived to save storage"
  ]
};

const communityTroubleshootingContent = {
  issues: [
    {
      symptom: "Posts not showing from other nodes",
      causes: ["No network connection", "Nodes out of range", "Sync in progress"],
      fixes: ["Check Communications panel status", "Move closer to other nodes", "Wait for sync to complete"],
      fallback: "Your posts are saved locally and will sync when connection is restored"
    },
    {
      symptom: "My post didn't send",
      causes: ["Post pending sync", "Post too large", "Network congestion"],
      fixes: ["Check sync status indicator", "Keep posts under 280 characters", "Wait and retry"],
    },
    {
      symptom: "Poll votes not updating",
      causes: ["Votes from offline nodes pending", "Poll already closed", "Sync delay"],
      fixes: ["Pull to refresh feed", "Check poll expiry time", "Wait for mesh sync"],
    },
    {
      symptom: "Reactions not saving",
      causes: ["Local storage full", "Sync error", "Post was deleted"],
      fixes: ["Clear old posts in settings", "Refresh feed", "Post may no longer exist"],
    }
  ],
  safetyNotes: [
    "All posts are stored locally first",
    "Posts sync via mesh when nodes are in range",
    "Alert posts have higher sync priority",
    "No posts leave your local network"
  ]
};

const communityLegendItems = [
  { color: "bg-destructive", label: "Alert", meaning: "Urgent message", action: "Read immediately" },
  { color: "bg-primary", label: "Post", meaning: "Regular update" },
  { color: "bg-warning", label: "Poll", meaning: "Vote to respond" },
  { color: "bg-success", label: "Synced", meaning: "Delivered to network" },
  { color: "bg-muted-foreground", label: "Pending", meaning: "Awaiting sync" },
];

const communityQuickTips = [
  "Tap reactions to respond quickly without typing",
  "Alert posts sync first when network is limited",
  "Pull down to refresh and sync latest posts"
];

// Mock community feed data
const getMockFeed = () => [
  {
    id: 'post-001',
    type: 'alert',
    author: {
      node_id: 'omega-03',
      name: "Kids' OMEGA",
      avatar: null,
    },
    content: "⚠️ Battery critical on Kids device! Need charger ASAP!",
    timestamp: new Date(Date.now() - 300000),
    reactions: {
      '👍': 2,
      '❤️': 1,
      '😮': 1,
    },
    myReaction: '😮',
    comments: [
      { 
        id: 'c1', 
        author: { node_id: 'omega-01', name: "Dad's OMEGA" },
        content: "On my way with the backup battery!",
        timestamp: new Date(Date.now() - 240000),
      },
      {
        id: 'c2',
        author: { node_id: 'omega-02', name: "Mom's OMEGA" },
        content: "There's a solar charger in the blue bag",
        timestamp: new Date(Date.now() - 180000),
      }
    ],
    synced: true,
  },
  {
    id: 'post-002',
    type: 'poll',
    author: {
      node_id: 'omega-01',
      name: "Dad's OMEGA",
      avatar: null,
    },
    content: "Where should we set up camp tonight?",
    timestamp: new Date(Date.now() - 3600000),
    poll: {
      options: [
        { id: 'opt1', text: 'North Ridge - better signal', votes: 2 },
        { id: 'opt2', text: 'Valley - more shelter', votes: 1 },
        { id: 'opt3', text: 'Stay at current location', votes: 0 },
      ],
      myVote: 'opt1',
      totalVotes: 3,
      expiresAt: new Date(Date.now() + 72000000),
    },
    reactions: {
      '👍': 3,
    },
    myReaction: null,
    comments: [],
    synced: true,
  },
  {
    id: 'post-003',
    type: 'post',
    author: {
      node_id: 'omega-02',
      name: "Mom's OMEGA",
      avatar: null,
    },
    content: "Found fresh water source about 500 feet east of here. Water test kit shows safe to drink after boiling. 🌊",
    timestamp: new Date(Date.now() - 7200000),
    reactions: {
      '👍': 3,
      '❤️': 2,
    },
    myReaction: '👍',
    comments: [
      {
        id: 'c3',
        author: { node_id: 'omega-01', name: "Dad's OMEGA" },
        content: "Great find! Marking on the map.",
        timestamp: new Date(Date.now() - 7000000),
      }
    ],
    synced: true,
  },
  {
    id: 'post-004',
    type: 'post',
    author: {
      node_id: 'omega-01',
      name: "Dad's OMEGA",
      avatar: null,
    },
    content: "Weather forecast from radio: Clear skies next 48hrs, then possible rain. Plan accordingly. ⛅",
    timestamp: new Date(Date.now() - 14400000),
    reactions: {
      '👍': 4,
    },
    myReaction: null,
    comments: [],
    synced: true,
  },
  {
    id: 'post-005',
    type: 'post',
    author: {
      node_id: 'omega-04',
      name: "Backup OMEGA",
      avatar: null,
    },
    content: "Note: This device will be offline for the next 2 hours while I hike to the overlook for better signal.",
    timestamp: new Date(Date.now() - 18000000),
    reactions: {
      '👍': 2,
    },
    myReaction: null,
    comments: [],
    synced: false,
  },
];

// Reaction emoji options
const reactionEmojis = ['👍', '❤️', '😮', '😢', '🎉'];

// Get avatar color based on node ID
const getAvatarColor = (nodeId) => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
  ];
  const hash = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Format relative time - Twitter style
const formatRelativeTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Twitter/X style Post card component
const PostCard = ({ post, onReact, onVote, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(post.myReaction === '❤️');
  const [likeCount, setLikeCount] = useState(
    Object.values(post.reactions).reduce((a, b) => a + b, 0)
  );
  
  const isAlert = post.type === 'alert';
  const isPoll = post.type === 'poll';
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
      onReact(post.id, null);
    } else {
      setLikeCount(prev => prev + 1);
      onReact(post.id, '❤️');
    }
    setLiked(!liked);
  };
  
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };
  
  return (
    <article 
      className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${
        isAlert ? 'bg-destructive/5 border-l-2 border-l-destructive' : ''
      }`}
      data-testid={`post-${post.id}`}
    >
      <div className="px-4 py-3 flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(post.author.node_id)} flex items-center justify-center text-white font-bold text-sm`}>
            {post.author.name.charAt(0)}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-[15px] text-foreground truncate">
              {post.author.name}
            </span>
            {isAlert && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-destructive text-white">
                ALERT
              </span>
            )}
            <span className="text-muted-foreground text-[15px]">·</span>
            <span className="text-muted-foreground text-[15px]">
              {formatRelativeTime(post.timestamp)}
            </span>
            {!post.synced && (
              <span className="text-xs text-warning">• pending</span>
            )}
            <div className="ml-auto">
              <button className="p-1.5 -m-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Post Content */}
          <p className="text-[15px] leading-normal mt-0.5 whitespace-pre-wrap break-words">
            {post.content}
          </p>
          
          {/* Poll Options - Twitter style */}
          {isPoll && post.poll && (
            <div className="mt-3 space-y-2" data-testid={`poll-${post.id}`}>
              {post.poll.options.map((option) => {
                const percentage = post.poll.totalVotes > 0 
                  ? Math.round((option.votes / post.poll.totalVotes) * 100) 
                  : 0;
                const isMyVote = post.poll.myVote === option.id;
                const isWinning = percentage === Math.max(...post.poll.options.map(o => 
                  post.poll.totalVotes > 0 ? Math.round((o.votes / post.poll.totalVotes) * 100) : 0
                ));
                
                return (
                  <button
                    key={option.id}
                    onClick={() => onVote(post.id, option.id)}
                    className="w-full text-left relative overflow-hidden rounded-full border border-border/50 hover:border-primary/50 transition-colors"
                    data-testid={`poll-option-${option.id}`}
                  >
                    {/* Progress bar */}
                    <div 
                      className={`absolute inset-y-0 left-0 transition-all ${
                        isMyVote ? 'bg-primary/30' : isWinning ? 'bg-muted/80' : 'bg-muted/50'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative px-4 py-2.5 flex items-center justify-between">
                      <span className={`text-sm ${isMyVote ? 'font-bold' : ''}`}>
                        {isMyVote && <Check className="w-4 h-4 inline mr-1.5 text-primary" />}
                        {option.text}
                      </span>
                      <span className={`text-sm ${isWinning ? 'font-bold' : 'text-muted-foreground'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
              <div className="text-xs text-muted-foreground pt-1">
                {post.poll.totalVotes} votes · {post.poll.expiresAt > new Date() ? 'Poll active' : 'Final results'}
              </div>
            </div>
          )}
          
          {/* Action Bar - Twitter style */}
          <div className="flex items-center justify-between mt-3 max-w-md -ml-2">
            {/* Reply */}
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 p-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors group"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              {post.comments.length > 0 && (
                <span className="text-xs group-hover:text-primary">{post.comments.length}</span>
              )}
            </button>
            
            {/* Repost/Share */}
            <button className="flex items-center gap-1 p-2 rounded-full hover:bg-success/10 text-muted-foreground hover:text-success transition-colors group">
              <RefreshCw className="w-[18px] h-[18px]" />
            </button>
            
            {/* Like */}
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 p-2 rounded-full transition-colors group ${
                liked 
                  ? 'text-pink-500' 
                  : 'text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500'
              }`}
            >
              <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-current' : ''}`} />
              {likeCount > 0 && (
                <span className={`text-xs ${liked ? 'text-pink-500' : 'group-hover:text-pink-500'}`}>
                  {likeCount}
                </span>
              )}
            </button>
            
            {/* Share */}
            <button className="flex items-center gap-1 p-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="w-[18px] h-[18px]" />
            </button>
          </div>
          
          {/* Comments Section - Thread style */}
          {showComments && (
            <div className="mt-3 border-t border-border/50 pt-3 space-y-3" data-testid={`comments-${post.id}`}>
              {/* Existing Comments */}
              {post.comments.map((comment, idx) => (
                <div key={comment.id} className="flex gap-3">
                  {/* Thread line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(comment.author.node_id)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {comment.author.name.charAt(0)}
                    </div>
                    {idx < post.comments.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border/50 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">{comment.author.name}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">{formatRelativeTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {/* New Comment Input */}
              <div className="flex gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  Y
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Post your reply"
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                  />
                  <Button 
                    size="sm" 
                    className="rounded-full px-4 h-8 font-bold"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// Mock Status Data for Status Report
const getMockStatusData = () => ({
  battery: { percentage: 72, runtime: '4h 5m' },
  gps: { fix: '3D', accuracy: '±10 ft' },
  comms: { available: 2, degraded: 1, unavailable: 2, selected: 'LAN / Wi-Fi' },
});

// New Post Composer with Status Report feature
const NewPostComposer = ({ onPost, onClose }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('post');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollHasImages, setPollHasImages] = useState(false);
  const [isAlertPost, setIsAlertPost] = useState(false);
  
  const handleAddOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };
  
  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };
  
  // Generate Status Report content
  const handleStatusReport = () => {
    const status = getMockStatusData();
    const timestamp = new Date().toLocaleString();
    
    const statusContent = `📊 #StatusReport

🔋 Battery: ${status.battery.percentage}% | Runtime: ${status.battery.runtime}
📍 GPS: ${status.gps.fix} Fix | Accuracy: ${status.gps.accuracy}
📡 Comms: ${status.comms.available} UP / ${status.comms.degraded} WEAK / ${status.comms.unavailable} DOWN
🔌 Using: ${status.comms.selected}

⏰ ${timestamp}`;
    
    setContent(statusContent);
    setType(isAlertPost ? 'alert' : 'post');
  };
  
  const handleSubmit = () => {
    if (!content.trim()) return;
    
    const newPost = {
      type,
      content,
      ...(type === 'poll' && {
        poll: {
          options: pollOptions.filter(o => o.trim()).map((text, i) => ({
            id: `new-opt-${i}`,
            text,
            image: pollHasImages ? `placeholder-image-${i}` : null, // UI-stubbed image support
            votes: 0
          })),
          expiresAt: new Date(Date.now() + 86400000),
          hasImages: pollHasImages,
        }
      })
    };
    
    onPost(newPost);
    onClose();
  };
  
  return (
    <div className="glass-strong rounded-xl p-4 space-y-4 animate-fade-in" data-testid="new-post-composer">
      {/* Type Selector */}
      <div className="flex gap-2">
        {[
          { id: 'post', label: 'Post', icon: MessageCircle },
          { id: 'alert', label: 'Alert', icon: AlertCircle },
          { id: 'poll', label: 'Poll', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setType(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              type === id 
                ? id === 'alert' 
                  ? 'bg-destructive text-destructive-foreground' 
                  : id === 'poll'
                    ? 'bg-warning text-warning-foreground'
                    : 'bg-primary text-primary-foreground'
                : 'glass hover:bg-muted'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      
      {/* STATUS REPORT BUTTON */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleStatusReport}
        className="w-full flex items-center justify-center gap-2 border-primary/30 hover:bg-primary/10"
        data-testid="status-report-btn"
      >
        <FileText className="w-4 h-4 text-primary" />
        <span className="font-medium">Post Status Report</span>
        <span className="text-xs text-muted-foreground">(Auto-fill from device)</span>
      </Button>
      
      {/* Alert toggle for Status Report */}
      {content.includes('#StatusReport') && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            id="alert-toggle"
            checked={isAlertPost}
            onChange={(e) => {
              setIsAlertPost(e.target.checked);
              setType(e.target.checked ? 'alert' : 'post');
            }}
            className="w-4 h-4 rounded border-destructive accent-destructive"
          />
          <label htmlFor="alert-toggle" className="flex items-center gap-1.5 cursor-pointer">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive font-medium">Share as Alert</span>
          </label>
        </div>
      )}
      
      {/* Content Input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          type === 'alert' 
            ? "What's the urgent update?" 
            : type === 'poll' 
              ? "What's your question?"
              : "What's on your mind?"
        }
        className="w-full h-24 p-3 rounded-lg glass border-0 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      
      {/* Poll Options */}
      {type === 'poll' && (
        <div className="space-y-3">
          {/* Image poll toggle */}
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="image-poll"
              checked={pollHasImages}
              onChange={(e) => setPollHasImages(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="image-poll" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>Add images to options</span>
              <span className="text-xs">(coming soon)</span>
            </label>
          </div>
          
          {pollOptions.map((option, index) => (
            <div key={index} className="flex gap-2">
              {pollHasImages && (
                <div className="w-12 h-12 rounded-lg glass border-2 border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                </div>
              )}
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...pollOptions];
                  newOptions[index] = e.target.value;
                  setPollOptions(newOptions);
                }}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              {pollOptions.length > 2 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 text-destructive"
                  onClick={() => handleRemoveOption(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          {pollOptions.length < 4 && (
            <Button variant="ghost" size="sm" onClick={handleAddOption} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8" title="Add image (coming soon)">
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={type === 'alert' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function CommunityTile() {
  const [feed, setFeed] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading feed
    setTimeout(() => {
      setFeed(getMockFeed());
      setLoading(false);
    }, 500);
  }, []);
  
  const handleReact = (postId, emoji) => {
    setFeed(feed.map(post => {
      if (post.id !== postId) return post;
      
      const newReactions = { ...post.reactions };
      
      // Remove old reaction if exists
      if (post.myReaction && newReactions[post.myReaction] > 0) {
        newReactions[post.myReaction]--;
        if (newReactions[post.myReaction] === 0) delete newReactions[post.myReaction];
      }
      
      // Add new reaction if different
      if (post.myReaction !== emoji) {
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        return { ...post, reactions: newReactions, myReaction: emoji };
      }
      
      return { ...post, reactions: newReactions, myReaction: null };
    }));
  };
  
  const handleVote = (postId, optionId) => {
    setFeed(feed.map(post => {
      if (post.id !== postId || !post.poll) return post;
      
      const newOptions = post.poll.options.map(opt => {
        if (opt.id === post.poll.myVote) {
          return { ...opt, votes: opt.votes - 1 };
        }
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      
      return {
        ...post,
        poll: {
          ...post.poll,
          options: newOptions,
          myVote: optionId,
        }
      };
    }));
  };
  
  const handleComment = (postId, content) => {
    setFeed(feed.map(post => {
      if (post.id !== postId) return post;
      
      return {
        ...post,
        comments: [
          ...post.comments,
          {
            id: `c-new-${Date.now()}`,
            author: { node_id: 'omega-self', name: 'You' },
            content,
            timestamp: new Date(),
          }
        ]
      };
    }));
  };
  
  const handleNewPost = (newPost) => {
    const post = {
      id: `post-new-${Date.now()}`,
      ...newPost,
      author: {
        node_id: 'omega-self',
        name: 'You',
        avatar: null,
      },
      timestamp: new Date(),
      reactions: {},
      myReaction: null,
      comments: [],
      synced: false,
      poll: newPost.poll ? {
        ...newPost.poll,
        myVote: null,
        totalVotes: 0,
      } : undefined,
    };
    
    setFeed([post, ...feed]);
  };
  
  const filteredFeed = filter === 'all' 
    ? feed 
    : feed.filter(post => post.type === filter);
  
  // Help view
  if (showHelp) {
    return (
      <Card className="glass-strong border-border-strong" data-testid="community-tile">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Community Help
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
              ← Back
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TileHelpTabs
            helpContent={communityHelpContent}
            troubleshootingContent={communityTroubleshootingContent}
            legendItems={communityLegendItems}
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="community-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Community
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComposer(!showComposer)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="New Post"
              data-testid="new-post-btn"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Help & Troubleshooting"
              data-testid="community-help-btn"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Tips */}
        <QuickHelpTips tips={communityQuickTips} />
        
        {/* New Post Composer */}
        {showComposer && (
          <NewPostComposer 
            onPost={handleNewPost}
            onClose={() => setShowComposer(false)}
          />
        )}
        
        {/* Filter Tabs */}
        <div className="flex gap-1 glass rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'alert', label: 'Alerts' },
            { id: 'poll', label: 'Polls' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}
              data-testid={`filter-${id}`}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Feed - Grid on desktop for wider layout */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-24 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="community-feed">
            {filteredFeed.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No {filter === 'all' ? 'posts' : filter + 's'} yet</p>
              </div>
            ) : (
              filteredFeed.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReact={handleReact}
                  onVote={handleVote}
                  onComment={handleComment}
                />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
