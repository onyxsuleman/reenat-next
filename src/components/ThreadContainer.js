'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function ThreadContainer({ thread, onThreadUpdated, productCode }) {
  const [mounted, setMounted] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Local state for photo request to make it instant in UI
  const [photoRequestCount, setPhotoRequestCount] = useState(thread.photo_request_count || 0);
  const [hasRequestedPhoto, setHasRequestedPhoto] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user already clicked photo request in this session
    const clicked = sessionStorage.getItem(`photo_req_${thread.id}`);
    if (clicked) setHasRequestedPhoto(true);
  }, [thread.id]);

  const formatDate = (dateStr) => {
    if (!mounted) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const handlePhotoRequest = async () => {
    if (hasRequestedPhoto) return;

    const newCount = photoRequestCount + 1;
    setPhotoRequestCount(newCount);
    setHasRequestedPhoto(true);
    sessionStorage.setItem(`photo_req_${thread.id}`, 'true');

    try {
      await supabase
        .from('community_threads')
        .update({ photo_request_count: newCount })
        .eq('id', thread.id);
    } catch (err) {
      console.error('Failed to update photo request count:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const threadUrl = `${window.location.origin}/reviews?product_id=${productCode}&thread=${thread.id}`;
    const shareText = `Check out this ${thread.thread_type === 'review' ? 'saree review' : 'community question'} about Reenat Trends saree ${productCode}: ${threadUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    
    // Create new reply object
    const newReply = {
      id: `reply_${Date.now()}`,
      user: {
        name: 'Shopper ' + Math.floor(1000 + Math.random() * 9000), // Random customer label or you can use logged session
        is_verified_buyer: false,
        is_artisan_or_staff: false
      },
      content: replyContent.trim(),
      created_at: new Date().toISOString()
    };

    const updatedReplies = [...(thread.replies || []), newReply];

    try {
      const { error } = await supabase
        .from('community_threads')
        .update({ replies: updatedReplies })
        .eq('id', thread.id);

      if (error) throw error;

      setReplyContent('');
      setIsReplyOpen(false);
      
      // Notify parent to refetch/reload data
      if (onThreadUpdated) {
        onThreadUpdated();
      }
    } catch (err) {
      console.error('Failed to save reply:', err.message);
      alert('Could not submit reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Render perception dot position on scale
  const renderPerceptionScale = (label, val, leftLabel, rightLabel) => {
    if (!val) return null;
    return (
      <div className="flex flex-col gap-1 w-full max-w-[200px]">
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>{label}</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{val}/5</span>
        </div>
        <div className="relative h-1 bg-slate-200 dark:bg-white/10 rounded-full w-full flex items-center">
          <div 
            className="absolute size-2 rounded-full bg-[#F1BF0A] shadow"
            style={{ left: `${((val - 1) / 4) * 100}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    );
  };

  const initials = thread.user_name ? thread.user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="bg-white/40 dark:bg-black/10 border border-slate-200/50 dark:border-white/5 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3 items-center">
          {/* Avatar */}
          <div className="size-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-200 select-none">
            {initials}
          </div>
          
          {/* User Name & Badges */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                {thread.user_name}
              </span>
              {thread.is_verified_buyer && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-[#25D366] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  ✓ Verified Buyer
                </span>
              )}
              {thread.draping_tag && (
                <span className="bg-[#183fad]/10 dark:bg-[#F1BF0A]/10 text-[#183fad] dark:text-[#F1BF0A] text-[9px] font-semibold px-2 py-0.5 rounded-full">
                  🥻 {thread.draping_tag}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {formatDate(thread.created_at)}
            </span>
          </div>
        </div>

        {/* Rating Stars (Reviews Only) */}
        {thread.thread_type === 'review' && (
          <div className="flex text-amber-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < thread.rating ? '★' : '☆'}</span>
            ))}
          </div>
        )}
      </div>

      {/* Main Review/Question Content */}
      <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line">
        {thread.content}
      </div>

      {/* Optional Photo Attachment */}
      {thread.photo_url && (
        <div className="relative max-w-sm rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 aspect-video bg-slate-100 dark:bg-black/20">
          <img 
            src={thread.photo_url} 
            alt="User uploaded detail" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Fabric Scales (Reviews Only) */}
      {thread.thread_type === 'review' && (thread.texture_perception || thread.weight_perception) && (
        <div className="flex flex-wrap gap-6 border-t border-b border-slate-200/40 dark:border-white/5 py-3">
          {renderPerceptionScale('Texture Scale', thread.texture_perception, 'Soft', 'Stiff')}
          {renderPerceptionScale('Weight Scale', thread.weight_perception, 'Lightweight', 'Heavy Weave')}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
        {/* Reply Trigger */}
        <button 
          onClick={() => setIsReplyOpen(!isReplyOpen)}
          className="hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          💬 Reply ({thread.replies ? thread.replies.length : 0})
        </button>

        {/* Request Photo Anchor */}
        {!thread.photo_url && (
          <button 
            onClick={handlePhotoRequest}
            className={`flex items-center gap-1 bg-transparent border-0 cursor-pointer ${
              hasRequestedPhoto 
                ? 'text-emerald-600 dark:text-[#25D366]' 
                : 'hover:text-[#F1BF0A]'
            }`}
          >
            📸 Request Real-Light Photo ({photoRequestCount})
          </button>
        )}

        {/* WhatsApp Share */}
        <button 
          onClick={handleShareWhatsApp}
          className="hover:text-emerald-500 flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          Share on WhatsApp
        </button>
      </div>

      {/* Nested Replies Loop */}
      {thread.replies && thread.replies.length > 0 && (
        <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-3 pt-2">
          {thread.replies.map((reply) => (
            <div key={reply.id} className="bg-slate-100/50 dark:bg-white/5 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {reply.user.name}
                </span>
                {reply.user.is_verified_buyer && (
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-[#25D366] font-bold px-1.5 py-0.5 rounded-full">
                    ✓ Buyer
                  </span>
                )}
                {reply.user.is_artisan_or_staff && (
                  <span className="text-[8px] bg-[#F1BF0A]/20 text-slate-800 dark:text-[#F1BF0A] font-bold px-1.5 py-0.5 rounded-full">
                    ★ Staff
                  </span>
                )}
                <span className="text-[9px] text-slate-400 ml-auto">
                  {formatDate(reply.created_at)}
                </span>
              </div>
              <p className="text-slate-650 dark:text-slate-300 text-xs sm:text-sm">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Write Box */}
      {isReplyOpen && (
        <form onSubmit={handleAddReply} className="pl-4 pt-2 flex gap-2">
          <input 
            type="text" 
            placeholder="Write your response..." 
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={isSubmittingReply}
            className="flex-1 text-xs sm:text-sm bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-full px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-[#F1BF0A]"
          />
          <button 
            type="submit" 
            disabled={!replyContent.trim() || isSubmittingReply}
            className="bg-[#183fad] dark:bg-white hover:bg-slate-850 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-full px-4 py-2 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmittingReply ? 'Sending...' : 'Reply'}
          </button>
        </form>
      )}
    </div>
  );
}
