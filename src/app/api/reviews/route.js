import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';

const ipCache = new Map();

// rate-limit helper: max 5 reviews/questions per hour per IP
function checkRateLimit(ip) {
  const now = Date.now();
  const timeframe = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5;

  if (!ipCache.has(ip)) {
    ipCache.set(ip, [now]);
    return true;
  }

  const timestamps = ipCache.get(ip).filter(time => now - time < timeframe);
  if (timestamps.length >= maxRequests) {
    return false;
  }

  timestamps.push(now);
  ipCache.set(ip, timestamps);
  return true;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    
    // 1. IP Rate Limiting Check
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again in an hour.' }, { status: 429 });
    }

    const body = await request.json();
    const {
      product_id,
      thread_type,
      user_id,
      user_name,
      is_verified_buyer,
      content,
      rating,
      draping_tag,
      texture_perception,
      weight_perception,
      photo_url
    } = body;

    // 2. Validate essential fields
    if (!product_id || !thread_type || !user_name || !content) {
      return NextResponse.json({ error: 'Missing required review fields.' }, { status: 400 });
    }

    if (thread_type !== 'review' && thread_type !== 'question') {
      return NextResponse.json({ error: 'Invalid thread type.' }, { status: 400 });
    }

    if (thread_type === 'review') {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return NextResponse.json({ error: 'Rating must be an integer between 1 and 5.' }, { status: 400 });
      }
    }

    // 4. Save to Database
    const supabase = getSupabaseServerClient();
    
    const newThread = {
      product_id: Number(product_id),
      thread_type,
      user_id: user_id || `user_${user_name.trim().toLowerCase().replace(/\s+/g, '_')}`,
      user_name: user_name.trim(),
      is_verified_buyer: !!is_verified_buyer,
      content: content.trim(),
      replies: [],
      rating: thread_type === 'review' ? Number(rating) : null,
      draping_tag: thread_type === 'review' ? draping_tag : null,
      texture_perception: thread_type === 'review' ? Number(texture_perception) : null,
      weight_perception: thread_type === 'review' ? Number(weight_perception) : null,
      photo_url: thread_type === 'review' && photo_url ? photo_url.trim() : null,
      photo_request_count: 0
    };

    const { data, error } = await supabase
      .from('community_threads')
      .insert([newThread])
      .select();

    if (error) {
      console.error("Database insert thread failure:", error.message);
      return NextResponse.json({ error: 'Failed to submit thread to database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });

  } catch (err) {
    console.error("Reviews submit route exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
