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
  FileText,
  Bookmark,
  Sparkles
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

// X/Twitter style Post card component - matching X's exact design
const PostCard = ({ post, onReact, onVote, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(post.myReaction === '❤️');
  const [likeCount, setLikeCount] = useState(
    Object.values(post.reactions).reduce((a, b) => a + b, 0)
  );
  const [retweeted, setRetweeted] = useState(false);
  const [retweetCount, setRetweetCount] = useState(Math.floor(Math.random() * 50) + 1);
  const [bookmarked, setBookmarked] = useState(false);
  const [viewCount] = useState(Math.floor(Math.random() * 1000) + 100);
  
  const isAlert = post.type === 'alert';
  const isPoll = post.type === 'poll';
  
  // Generate a consistent @handle from node_id
  const getHandle = (nodeId) => {
    return `@${nodeId.replace('-', '_')}`;
  };
  
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
  
  const handleRetweet = () => {
    setRetweeted(!retweeted);
    setRetweetCount(prev => retweeted ? prev - 1 : prev + 1);
  };
  
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };

  // Format numbers like X does (1.2K, etc)
  const formatCount = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  return (
    <article 
      className={`border-b border-[#2f3336] hover:bg-white/[0.03] transition-colors cursor-pointer ${
        isAlert ? 'border-l-2 border-l-destructive bg-destructive/5' : ''
      }`}
      data-testid={`post-${post.id}`}
    >
      <div className="px-4 py-3 flex gap-3">
        {/* Avatar - X style circular */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(post.author.node_id)} flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity`}>
            {post.author.name.charAt(0)}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row - Exactly like X */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1 min-w-0 flex-wrap">
              <span className="font-bold text-[15px] text-[#e7e9ea] hover:underline cursor-pointer truncate">
                {post.author.name}
              </span>
              {isAlert && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-destructive text-white ml-1">
                  ALERT
                </span>
              )}
              <span className="text-[#71767b] text-[15px] truncate">
                {getHandle(post.author.node_id)}
              </span>
              <span className="text-[#71767b] text-[15px]">·</span>
              <span className="text-[#71767b] text-[15px] hover:underline cursor-pointer">
                {formatRelativeTime(post.timestamp)}
              </span>
              {!post.synced && (
                <span className="text-xs text-warning ml-1">• pending</span>
              )}
            </div>
            {/* Three dot menu */}
            <button className="p-2 -m-2 rounded-full hover:bg-[#1d9bf0]/10 text-[#71767b] hover:text-[#1d9bf0] transition-colors group">
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </button>
          </div>
          
          {/* Post Content */}
          <div className="mt-0.5">
            <p className="text-[15px] leading-[20px] text-[#e7e9ea] whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
          
          {/* Poll Options - X style */}
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
                    className="w-full text-left relative overflow-hidden rounded-lg border border-[#536471] hover:border-[#1d9bf0] transition-colors"
                    data-testid={`poll-option-${option.id}`}
                  >
                    <div 
                      className={`absolute inset-y-0 left-0 transition-all ${
                        isMyVote ? 'bg-[#1d9bf0]/30' : isWinning ? 'bg-[#71767b]/30' : 'bg-[#71767b]/20'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative px-3 py-2.5 flex items-center justify-between">
                      <span className={`text-[15px] ${isMyVote ? 'font-bold text-[#e7e9ea]' : 'text-[#e7e9ea]'}`}>
                        {isMyVote && <Check className="w-4 h-4 inline mr-1.5 text-[#1d9bf0]" />}
                        {option.text}
                      </span>
                      <span className={`text-[15px] ${isWinning ? 'font-bold text-[#e7e9ea]' : 'text-[#71767b]'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
              <div className="text-[13px] text-[#71767b] pt-1">
                {post.poll.totalVotes} votes · {post.poll.expiresAt > new Date() ? 'Poll active' : 'Final results'}
              </div>
            </div>
          )}
          
          {/* Action Bar - Exact X style */}
          <div className="flex items-center justify-between mt-3 max-w-[425px] -ml-2">
            {/* Reply/Comment */}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
              className="flex items-center gap-1 group"
              data-testid={`reply-btn-${post.id}`}
            >
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px] text-[#71767b] group-hover:text-[#1d9bf0]" />
              </div>
              {post.comments.length > 0 && (
                <span className="text-[13px] text-[#71767b] group-hover:text-[#1d9bf0] -ml-1">
                  {post.comments.length}
                </span>
              )}
            </button>
            
            {/* Repost/Retweet */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleRetweet(); }}
              className="flex items-center gap-1 group"
              data-testid={`retweet-btn-${post.id}`}
            >
              <div className={`p-2 rounded-full transition-colors ${retweeted ? 'text-[#00ba7c]' : 'group-hover:bg-[#00ba7c]/10'}`}>
                <RefreshCw className={`w-[18px] h-[18px] ${retweeted ? 'text-[#00ba7c]' : 'text-[#71767b] group-hover:text-[#00ba7c]'}`} />
              </div>
              <span className={`text-[13px] -ml-1 ${retweeted ? 'text-[#00ba7c]' : 'text-[#71767b] group-hover:text-[#00ba7c]'}`}>
                {retweetCount}
              </span>
            </button>
            
            {/* Like */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className="flex items-center gap-1 group"
              data-testid={`like-btn-${post.id}`}
            >
              <div className={`p-2 rounded-full transition-colors ${liked ? '' : 'group-hover:bg-[#f91880]/10'}`}>
                <Heart className={`w-[18px] h-[18px] transition-colors ${liked ? 'fill-[#f91880] text-[#f91880]' : 'text-[#71767b] group-hover:text-[#f91880]'}`} />
              </div>
              {likeCount > 0 && (
                <span className={`text-[13px] -ml-1 ${liked ? 'text-[#f91880]' : 'text-[#71767b] group-hover:text-[#f91880]'}`}>
                  {likeCount}
                </span>
              )}
            </button>
            
            {/* View count */}
            <button 
              className="flex items-center gap-1 group"
              data-testid={`views-btn-${post.id}`}
            >
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <BarChart3 className="w-[18px] h-[18px] text-[#71767b] group-hover:text-[#1d9bf0]" />
              </div>
              <span className="text-[13px] text-[#71767b] group-hover:text-[#1d9bf0] -ml-1">
                {formatCount(viewCount)}
              </span>
            </button>
            
            {/* Bookmark & Share */}
            <div className="flex items-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
                className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors group"
                data-testid={`bookmark-btn-${post.id}`}
              >
                <svg viewBox="0 0 24 24" className={`w-[18px] h-[18px] ${bookmarked ? 'fill-[#1d9bf0] text-[#1d9bf0]' : 'text-[#71767b] group-hover:text-[#1d9bf0]'}`}>
                  <path fill="currentColor" d={bookmarked 
                    ? "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
                    : "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                  } />
                </svg>
              </button>
              <button 
                className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors group"
                data-testid={`share-btn-${post.id}`}
              >
                <Share2 className="w-[18px] h-[18px] text-[#71767b] group-hover:text-[#1d9bf0]" />
              </button>
            </div>
          </div>
          
          {/* Comments Section - X thread style */}
          {showComments && (
            <div className="mt-3 border-t border-[#2f3336] pt-3 space-y-3" data-testid={`comments-${post.id}`}>
              {/* Existing Comments */}
              {post.comments.map((comment, idx) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(comment.author.node_id)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {comment.author.name.charAt(0)}
                    </div>
                    {idx < post.comments.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[#2f3336] mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[15px] text-[#e7e9ea] hover:underline cursor-pointer">{comment.author.name}</span>
                      <span className="text-[#71767b] text-[15px]">{getHandle(comment.author.node_id)}</span>
                      <span className="text-[#71767b] text-[15px]">·</span>
                      <span className="text-[#71767b] text-[15px]">{formatRelativeTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-[15px] text-[#e7e9ea] mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {/* New Comment Input - X style */}
              <div className="flex gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-[#1d9bf0]/20 flex items-center justify-center text-[#1d9bf0] text-xs font-bold flex-shrink-0">
                  Y
                </div>
                <div className="flex-1 flex gap-2 items-center">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Post your reply"
                    className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#e7e9ea] placeholder:text-[#71767b]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button 
                    size="sm" 
                    className="rounded-full px-4 h-8 font-bold bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white"
                    onClick={(e) => { e.stopPropagation(); handleSubmitComment(); }}
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
    <div className="glass-strong border border-border-strong rounded-2xl overflow-hidden" data-testid="community-tile">
      {/* X-style Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/80 border-b border-[#2f3336]">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#e7e9ea]">Community</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowComposer(!showComposer)}
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 text-[#1d9bf0] transition-colors"
              title="New Post"
              data-testid="new-post-btn"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-white/10 text-[#e7e9ea] transition-colors"
              title="Settings"
              data-testid="community-settings-btn"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-full hover:bg-white/10 text-[#71767b] transition-colors"
              title="Help"
              data-testid="community-help-btn"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* X-style Tabs */}
        <div className="flex">
          {[
            { id: 'all', label: 'For you' },
            { id: 'alert', label: 'Alerts' },
            { id: 'poll', label: 'Polls' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex-1 py-4 text-[15px] font-medium transition-colors relative hover:bg-white/5 ${
                filter === id 
                  ? 'text-[#e7e9ea]' 
                  : 'text-[#71767b]'
              }`}
              data-testid={`filter-${id}`}
            >
              {label}
              {filter === id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Composer */}
      {showComposer && (
        <div className="border-b border-[#2f3336] p-4">
          <NewPostComposer 
            onPost={handleNewPost}
            onClose={() => setShowComposer(false)}
          />
        </div>
      )}
      
      {/* Feed - X style */}
      {loading ? (
        <div className="divide-y divide-[#2f3336]">
          {[1,2,3].map(i => (
            <div key={i} className="p-4 flex gap-3">
              <div className="skeleton w-10 h-10 rounded-full bg-[#2f3336]" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32 bg-[#2f3336] rounded" />
                <div className="skeleton h-4 w-full bg-[#2f3336] rounded" />
                <div className="skeleton h-4 w-3/4 bg-[#2f3336] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y-0" data-testid="community-feed">
          {filteredFeed.length === 0 ? (
            <div className="text-center py-16 text-[#71767b]">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-xl font-bold text-[#e7e9ea]">No {filter === 'all' ? 'posts' : filter + 's'} yet</p>
              <p className="text-[15px] mt-1">When there are posts, they'll show up here.</p>
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
    </div>
  );
}
