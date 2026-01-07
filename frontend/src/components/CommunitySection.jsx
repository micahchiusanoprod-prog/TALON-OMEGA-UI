import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, ThumbsUp, Clock, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import api from '../services/api';
import config from '../config';

export default function CommunitySection({ fullWidth = true }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getCommunityPosts();
        // Use mock posts if no data available
        if (!data.posts || data.posts.length === 0) {
          setPosts([
            {
              id: 1,
              author: 'OMEGA User',
              content: 'Just deployed the new firmware update! Everything running smooth.',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              likes: 5,
            },
            {
              id: 2,
              author: 'Cyberdeck Admin',
              content: 'Reminder: Kiwix library updated with new Wikipedia archives. Check it out!',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              likes: 12,
            },
          ]);
        } else {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch community posts:', error);
        // Set mock posts on error
        setPosts([
          {
            id: 1,
            author: 'OMEGA User',
            content: 'Just deployed the new firmware update! Everything running smooth.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            likes: 5,
          },
          {
            id: 2,
            author: 'Cyberdeck Admin',
            content: 'Reminder: Kiwix library updated with new Wikipedia archives. Check it out!',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            likes: 12,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, config.polling.community);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return postTime.toLocaleDateString();
  };

  const handleNewPost = () => {
    toast.info('New post editor - Coming soon');
  };

  return (
    <div className={fullWidth ? 'max-w-4xl mx-auto' : ''}>
      <Card className="glass-strong border-border flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Community
            </CardTitle>
            <Button
              size="sm"
              onClick={handleNewPost}
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </Button>
          </div>
        </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass p-4 rounded-lg hover:glass-strong transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{post.author}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(post.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{post.content}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No posts yet</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Polls - Coming soon')}
            className="text-xs border-border-strong bg-secondary/50 hover:bg-secondary hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            title="Create or vote on community polls"
          >
            Polls
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Chat - Coming soon')}
            className="text-xs border-border-strong bg-secondary/50 hover:bg-secondary hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            title="Real-time messaging with other users"
          >
            Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Files - Coming soon')}
            className="text-xs border-border-strong bg-secondary/50 hover:bg-secondary hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            title="Share and download files"
          >
            Files
          </Button>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
