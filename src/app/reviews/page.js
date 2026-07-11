'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ProductMiniCard from '../../components/ProductMiniCard';
import ThreadContainer from '../../components/ThreadContainer';

// Create Supabase client instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock verified registry: maps names/IDs to purchased Product ID list
const verifiedRegistry = {
  "Ananya Sharma": [42, 45],
  "Priya K.": [42],
  "Meera Rao": [43],
  "weaving_lover": [42]
};

function ReviewHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Parse NSY-style product code, e.g., NSY0042 -> 42
  const productCode = searchParams.get('product_id') || 'NSY0042';
  const numericId = parseInt(productCode.replace('NSY', ''), 10) || 42;
  const targetThreadId = searchParams.get('thread');

  const [product, setProduct] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'reviews', 'questions'
  const [tagFilter, setTagFilter] = useState('All'); // Draping tags
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState('review'); // 'review', 'question'
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [drapingTag, setDrapingTag] = useState('Traditional Maharashtrian');
  const [texturePerception, setTexturePerception] = useState(3);
  const [weightPerception, setWeightPerception] = useState(3);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [numericId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Product details
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', numericId)
        .single();

      if (prodErr) throw prodErr;
      setProduct(prodData);

      // 2. Fetch Threads
      const { data: threadData, error: threadErr } = await supabase
        .from('community_threads')
        .select('*')
        .eq('product_id', numericId)
        .order('created_at', { ascending: false });

      if (threadErr) throw threadErr;
      setThreads(threadData || []);

    } catch (err) {
      console.error('Failed to load review data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Mock validation check
    const purchaseList = verifiedRegistry[userName.trim()];
    const isVerified = purchaseList ? purchaseList.includes(numericId) : false;

    const newThread = {
      product_id: numericId,
      thread_type: formType,
      user_id: `user_${userName.trim().toLowerCase().replace(/\s+/g, '_')}`,
      user_name: userName.trim(),
      is_verified_buyer: isVerified,
      content: content.trim(),
      replies: [],
      rating: formType === 'review' ? rating : null,
      draping_tag: formType === 'review' ? drapingTag : null,
      texture_perception: formType === 'review' ? texturePerception : null,
      weight_perception: formType === 'review' ? weightPerception : null,
      photo_url: formType === 'review' && photoUrl.trim() ? photoUrl.trim() : null,
      photo_request_count: 0
    };

    try {
      const { error } = await supabase.from('community_threads').insert([newThread]);
      if (error) throw error;

      // Reset Form
      setUserName('');
      setContent('');
      setPhotoUrl('');
      setIsFormOpen(false);
      
      // Reload database values
      loadData();
    } catch (err) {
      console.error('Failed to insert thread:', err.message);
      alert('Could not submit. Please check your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate Aggregations (Only from Review threads)
  const reviewsList = threads.filter(t => t.thread_type === 'review');
  const questionsList = threads.filter(t => t.thread_type === 'question');

  const avgRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
    : '4.5';

  const avgTexture = reviewsList.length > 0
    ? (reviewsList.reduce((acc, curr) => acc + (curr.texture_perception || 3), 0) / reviewsList.length).toFixed(1)
    : '3.0';

  const avgWeight = reviewsList.length > 0
    ? (reviewsList.reduce((acc, curr) => acc + (curr.weight_perception || 3), 0) / reviewsList.length).toFixed(1)
    : '3.0';

  // Filtered threads logic
  const filteredThreads = threads.filter(thread => {
    // Tab filter
    if (activeTab === 'reviews' && thread.thread_type !== 'review') return false;
    if (activeTab === 'questions' && thread.thread_type !== 'question') return false;

    // Tag filter (for reviews)
    if (tagFilter !== 'All' && thread.draping_tag !== tagFilter) return false;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchText = (thread.content + ' ' + thread.user_name + ' ' + (thread.draping_tag || '')).toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    return true;
  });

  // Unique lists of draping tags used in catalog reviews
  const allDrapingTags = ['All', 'Traditional Maharashtrian', 'Modern Open Pallu', 'Gujarati Style', 'Bengali Draping', 'Mumtaz Retro Style', 'Casual Nivi'];

  if (isLoading && !product) {
    return (
      <div className="p-4 sm:p-6 mt-10 text-center py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-300 dark:bg-white/10 rounded-3xl w-full"></div>
          <div className="h-60 bg-slate-300 dark:bg-white/10 rounded-3xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 sm:p-6 mt-10 text-center py-20">
        <h2 className="text-xl font-bold text-red-500">Saree Variant Not Found</h2>
        <p className="text-slate-500 mt-2">The specified Product ID does not exist in our catalog database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
        
        {/* Sticky Header Reference Saree */}
        <section>
          <ProductMiniCard product={product} />
        </section>

        {/* Aggregated Perception Panels */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/40 dark:bg-black/10 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          {/* Average Rating Block */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 pb-4 md:pb-0 md:pr-6 text-center">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Owner Satisfaction Rating</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-anton text-slate-800 dark:text-[#F1BF0A]">
                {avgRating}
              </span>
              <span className="text-slate-400 text-lg">/ 5.0</span>
            </div>
            <div className="flex text-amber-400 text-lg mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(avgRating) ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="text-xs text-slate-400 mt-2">
              Based on {reviewsList.length} verified buyer reviews
            </span>
          </div>

          {/* Fabric Texture Scale */}
          <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 pb-4 md:pb-0 md:px-6">
            <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-3">Fabric Texture Gauge</h4>
            <div className="relative h-1.5 bg-slate-200 dark:bg-white/10 rounded-full w-full mb-2 flex items-center">
              <div 
                className="absolute size-3.5 rounded-full bg-[#183fad] dark:bg-[#F1BF0A] border-2 border-white dark:border-slate-900 shadow-md"
                style={{ left: `${((parseFloat(avgTexture) - 1) / 4) * 100}%`, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350 px-1">
              <span>Soft & Drapey</span>
              <span>Crisp & Stiff</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Buyers perceive the texture as slightly soft, ideal for neat pleats.</p>
          </div>

          {/* Fabric Weight Scale */}
          <div className="flex flex-col justify-center md:pl-6">
            <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-3">Fabric Weight Gauge</h4>
            <div className="relative h-1.5 bg-slate-200 dark:bg-white/10 rounded-full w-full mb-2 flex items-center">
              <div 
                className="absolute size-3.5 rounded-full bg-[#183fad] dark:bg-[#F1BF0A] border-2 border-white dark:border-slate-900 shadow-md"
                style={{ left: `${((parseFloat(avgWeight) - 1) / 4) * 100}%`, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350 px-1">
              <span>Airy & Light</span>
              <span>Heavy Weave</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Heavy zari borders contribute to a royal feel while keeping the body comfortable.</p>
          </div>
        </section>

        {/* Action Controls Section */}
        <section className="flex flex-wrap gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-white/40 dark:bg-black/20 p-1.5 rounded-full border border-slate-200/50 dark:border-white/5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' 
                  : 'text-slate-650 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All Threads ({threads.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reviews' 
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' 
                  : 'text-slate-650 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Reviews Only ({reviewsList.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'questions' 
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' 
                  : 'text-slate-650 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Q&A Hub ({questionsList.length})
            </button>
          </div>

          {/* Trigger write CTA */}
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-[#183fad] dark:bg-[#F1BF0A] hover:bg-slate-800 dark:hover:bg-[#d9a05b] text-white dark:text-slate-900 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-0"
          >
            ✏️ Join the Discussion
          </button>
        </section>

        {/* Collapsible Write Form */}
        {isFormOpen && (
          <section className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-anton text-slate-800 dark:text-white text-xl uppercase">Post to Community Board</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Your Full Name (Use "Ananya Sharma" or "Priya K." to test verified badge)</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full text-sm bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:border-[#F1BF0A]"
                  />
                </div>

                {/* Entry Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Entry Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full text-sm bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:border-[#F1BF0A]"
                  >
                    <option value="review">Write Saree Review</option>
                    <option value="question">Ask a Question</option>
                  </select>
                </div>
              </div>

              {/* Review Specific Fields */}
              {formType === 'review' && (
                <div className="space-y-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Stars */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">Rating</label>
                      <div className="flex gap-2 text-xl text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="hover:scale-115 transition-transform cursor-pointer bg-transparent border-0"
                          >
                            {star <= rating ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Draping Tags */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Draping Style Used</label>
                      <select
                        value={drapingTag}
                        onChange={(e) => setDrapingTag(e.target.value)}
                        className="w-full text-xs sm:text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="Traditional Maharashtrian">Traditional Maharashtrian</option>
                        <option value="Modern Open Pallu">Modern Open Pallu</option>
                        <option value="Gujarati Style">Gujarati Style</option>
                        <option value="Bengali Draping">Bengali Draping</option>
                        <option value="Mumtaz Retro Style">Mumtaz Retro Style</option>
                        <option value="Casual Nivi">Casual Nivi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Texture slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Texture Scale</span>
                        <span className="text-[#F1BF0A]">{texturePerception}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={texturePerception}
                        onChange={(e) => setTexturePerception(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Soft & Flowy</span>
                        <span>Stiff/Crisp</span>
                      </div>
                    </div>

                    {/* Weight slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Weight Scale</span>
                        <span className="text-[#F1BF0A]">{weightPerception}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={weightPerception}
                        onChange={(e) => setWeightPerception(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Airy/Light</span>
                        <span>Heavy Weave</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo URL */}
                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-bold text-slate-500">Attach Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="Paste link to your photo (e.g. https://domain.com/photo.jpg)"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Text Area Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">
                  {formType === 'review' ? 'Review Comments' : 'Community Question'}
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder={formType === 'review' ? 'Write about pleat drape, quality of zari, border comfort...' : 'Ask existing owners details about colors, draping ease, fabric thickness...'}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-sm bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 text-slate-800 dark:text-white focus:outline-none focus:border-[#F1BF0A] resize-none"
                />
              </div>

              {/* Submit triggers */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-full text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-800 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post to Board'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters and Search controls */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative sm:col-span-2">
            <input 
              type="text" 
              placeholder="Search reviews, Q&As, users, or styling tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 rounded-full pl-10 pr-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:border-[#F1BF0A]"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          </div>

          {/* Draping Tag Dropdown */}
          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 rounded-full px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none"
            >
              <option value="All">All Draping Styles</option>
              {allDrapingTags.slice(1).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Threads Feed Container */}
        <section className="space-y-6">
          {filteredThreads.length === 0 ? (
            <div className="bg-white/20 dark:bg-white/5 rounded-3xl p-10 text-center text-slate-500">
              <p className="font-semibold">No discussions match your filter criteria.</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to post a review or question for this saree!</p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <ThreadContainer 
                key={thread.id} 
                thread={thread} 
                onThreadUpdated={loadData}
                productCode={productCode}
              />
            ))
          )}
        </section>

    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#e9ecf6] dark:bg-[#060c18] flex items-center justify-center text-slate-500">
        Loading board reviews...
      </div>
    }>
      <ReviewHubContent />
    </Suspense>
  );
}
