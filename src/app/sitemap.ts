import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// 1. Initialize a simple Supabase client for fetching public data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BASE_URL = 'https://nyxusapp.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // --- 1. STATIC ROUTES ---
  // These exist as files in your 'app' folder. 
  // We prioritize main landing pages.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/grand-grimoire`, // Public spell feed
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tarot-deck`, // Gallery root
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/astrology`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Resource Galleries (Crystals, Herbs, etc)
    { url: `${BASE_URL}/crystals`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/herbs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/candles`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/essential-oils`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/runes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/deities`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/moon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/join`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]

  // --- 2. DYNAMIC: TAROT CARDS ---
  // Route: /tarot-deck/[slug]
  const { data: tarotCards } = await supabase
    .from('tarot_cards')
    .select('slug, id') // We only need the slug
  
  const tarotRoutes: MetadataRoute.Sitemap = (tarotCards || []).map((card) => ({
    url: `${BASE_URL}/tarot-deck/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // --- 3. DYNAMIC: ASTROLOGY SIGNS ---
  // Route: /astrology/[slug]
  // Your table uses 'name' (e.g. "Aries"), so we lower-case it for the URL.
  const { data: zodiacSigns } = await supabase
    .from('zodiac_signs')
    .select('name')

  const astrologyRoutes: MetadataRoute.Sitemap = (zodiacSigns || []).map((sign) => ({
    url: `${BASE_URL}/astrology/${sign.name.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // --- 4. DYNAMIC: USER PROFILES ---
  // Route: /u/[handle]
  // Only index profiles that have a handle set.
  const { data: profiles } = await supabase
    .from('profiles')
    .select('handle, updated_at')
    .not('handle', 'is', null) // Filter out null handles

  const profileRoutes: MetadataRoute.Sitemap = (profiles || []).map((profile) => ({
    url: `${BASE_URL}/u/${profile.handle}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
    changeFrequency: 'weekly', // Profiles change as users post
    priority: 0.8, // High priority because this is user-generated content
  }))

  // --- COMBINE EVERYTHING ---
  return [
    ...staticRoutes,
    ...tarotRoutes,
    ...astrologyRoutes,
    ...profileRoutes,
  ]
}