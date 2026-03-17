/**
 * Unsplash Source Service (No API Key Required)
 */

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

// Mapping design attributes to specific aesthetic DNA keywords
const dnaMap = {
  modernity: {
    high: ['Modernist Architecture', 'Futuristic Design', 'Contemporary Minimalist Art', 'High-tech Design'],
    low: ['Vintage Design', 'Classic Architecture', 'Retro Aesthetic', 'Traditional Craft']
  },
  minimalism: {
    high: ['Minimalist Abstract Sculpture', 'Pure Form Architecture', 'Zen Design', 'Empty Space'],
    low: ['Maximalist Pattern', 'Intricate Detail', 'Baroque Aesthetic', 'Complex Texture']
  },
  geometry: {
    high: ['Geometric Brutalism', 'Constructivist Design', 'Parametric Form', 'Sharp Edges'],
    low: ['Organic Shapes', 'Fluid Design', 'Natural Curves', 'Biomorphic Form']
  },
  vibrancy: {
    high: ['Vibrant Color Field', 'Neon Aesthetic', 'High Contrast Design', 'Bold Palette'],
    low: ['Muted Tones', 'Pastel Aesthetic', 'Monochromatic Design', 'Subtle Palette']
  },
  temperature: {
    warm: ['Warm Lighting Design', 'Golden Hour Architecture', 'Cozy Interior', 'Terracotta'],
    cool: ['Cool Lighting Design', 'Blue Hour Cityscape', 'Clinical Minimalist', 'Steel and Glass']
  }
};

export function mapToEnglish(query: string): string {
  const styleKeywords = ['minimal', 'modern', 'geometric', '3d', 'render', 'abstract', 'texture', 'organic', 'fluid', 'brutalism', 'futuristic', 'contemporary'];
  const words = query.toLowerCase().split(/[\s,]+/);
  const foundStyles = words.filter(w => styleKeywords.includes(w));
  
  return foundStyles.join(',');
}

const DESIGN_POOLS: Record<string, string[]> = {
  minimalist: [
    'photo-1486406146926-c627a92ad1ab',
    'photo-1494438639942-882ba9927e26',
    'photo-1518005020951-eccb494ad742',
    'photo-1503387762-592dea58ef23',
    'photo-1487958449943-2429e8be8625',
    'photo-1511467687858-23d96c32e4ae',
    'photo-1508333706533-1ab43ecb1606',
    'photo-1518780664697-55e3ad937233',
    'photo-1493397212122-2b85dda8106b',
    'photo-1507652313519-d451e12d596d'
  ],
  modern: [
    'photo-1550684848-fac1c5b4e853',
    'photo-1515895309288-a3815ab7cf81',
    'photo-1507652313519-d451e12d596d',
    'photo-1493397212122-2b85dda8106b',
    'photo-1511467687858-23d96c32e4ae',
    'photo-1487958449943-2429e8be8625',
    'photo-1508333706533-1ab43ecb1606',
    'photo-1518780664697-55e3ad937233',
    'photo-1470770841072-f978cf4d019e',
    'photo-1441974231531-c6227db76b6e'
  ],
  organic: [
    'photo-1513519245088-0e12902e5a38',
    'photo-1505330622279-bf7d7fc918f4',
    'photo-1518780664697-55e3ad937233',
    'photo-1469474968028-56623f02e42e',
    'photo-1500382017468-9049fed747ef',
    'photo-1441974231531-c6227db76b6e',
    'photo-1513694203232-719a280e022f',
    'photo-1502672260266-1c1ef2d93688',
    'photo-1472214103451-9374bd1c798e',
    'photo-1444703686981-a3abbc4d4fe3'
  ],
  vibrant: [
    'photo-1550684848-fac1c5b4e853',
    'photo-1515895309288-a3815ab7cf81',
    'photo-1504333638930-c8787321eee0',
    'photo-1557683316-973673baf926',
    'photo-1557682250-33bd709cbe85',
    'photo-1557682224-5b8590cd9ec5',
    'photo-1525909002-1b05e0c869d8',
    'photo-1513151233558-d860c5398176'
  ],
  geometric: [
    'photo-1518005020951-eccb494ad742',
    'photo-1503387762-592dea58ef23',
    'photo-1486406146926-c627a92ad1ab',
    'photo-1494438639942-882ba9927e26',
    'photo-1508333706533-1ab43ecb1606',
    'photo-1511467687858-23d96c32e4ae',
    'photo-1493397212122-2b85dda8106b',
    'photo-1507652313519-d451e12d596d'
  ]
};

export async function searchUnsplashImages(query: string, perPage: number = 12): Promise<UnsplashImage[]> {
  const results: UnsplashImage[] = [];
  
  const tags = query.toLowerCase().split(',').map(t => t.trim()).filter(t => t.length > 0);
  
  // Determine which pool to use based on keywords
  let pool: string[] = [];
  
  if (tags.some(t => t.includes('minimal'))) pool = [...pool, ...DESIGN_POOLS.minimalist];
  if (tags.some(t => t.includes('modern'))) pool = [...pool, ...DESIGN_POOLS.modern];
  if (tags.some(t => t.includes('organic') || t.includes('soft') || t.includes('nature'))) pool = [...pool, ...DESIGN_POOLS.organic];
  if (tags.some(t => t.includes('vibrant') || t.includes('neon') || t.includes('color'))) pool = [...pool, ...DESIGN_POOLS.vibrant];
  if (tags.some(t => t.includes('geometric') || t.includes('brutalism') || t.includes('structure'))) pool = [...pool, ...DESIGN_POOLS.geometric];
  
  // Fallback to all design pools if no specific match
  if (pool.length === 0) {
    pool = [...DESIGN_POOLS.minimalist, ...DESIGN_POOLS.modern, ...DESIGN_POOLS.organic, ...DESIGN_POOLS.vibrant, ...DESIGN_POOLS.geometric];
  }

  // Shuffle pool to get different images on refresh
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

  // Ensure at least 6 images
  const count = Math.max(perPage, 6);

  for (let i = 0; i < count; i++) {
    const photoId = shuffledPool[i % shuffledPool.length];
    const seed = Math.floor(Math.random() * 10000) + i;
    
    // Direct Unsplash Image URL - Guaranteed high-end design content, NO CATS
    const imageUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=1200&q=80&sig=${seed}`;
    
    results.push({
      id: `${photoId}-${seed}`,
      urls: {
        regular: imageUrl,
        small: imageUrl,
        thumb: imageUrl,
      },
      alt_description: "High-end Design Reference",
      user: {
        name: "Aesthetic Intelligence",
        links: {
          html: "https://unsplash.com",
        },
      },
    });
  }

  return results;
}

export function getKeywordsFromDNA(insights: any, options: string[] = [], idea: string = ''): string {
  const keywords = new Set<string>();
  
  if (insights?.visual_balance) {
    const vb = insights.visual_balance;
    // Modernity
    if (vb.modernity > 70) keywords.add(dnaMap.modernity.high[Math.floor(Math.random() * dnaMap.modernity.high.length)]);
    else if (vb.modernity < 30) keywords.add(dnaMap.modernity.low[Math.floor(Math.random() * dnaMap.modernity.low.length)]);
    
    // Minimalism
    if (vb.minimalism > 70) keywords.add(dnaMap.minimalism.high[Math.floor(Math.random() * dnaMap.minimalism.high.length)]);
    else if (vb.minimalism < 30) keywords.add(dnaMap.minimalism.low[Math.floor(Math.random() * dnaMap.minimalism.low.length)]);

    // Geometry (Visual Balance doesn't have geometry directly, but we can infer from options or use aesthetic as proxy)
    if (options.includes('Geometric')) keywords.add(dnaMap.geometry.high[Math.floor(Math.random() * dnaMap.geometry.high.length)]);
    if (options.includes('Soft Volume') || options.includes('Organic Curve')) keywords.add(dnaMap.geometry.low[Math.floor(Math.random() * dnaMap.geometry.low.length)]);
    
    // Vibrancy
    if (vb.vibrancy > 70) keywords.add(dnaMap.vibrancy.high[Math.floor(Math.random() * dnaMap.vibrancy.high.length)]);
    else if (vb.vibrancy < 30) keywords.add(dnaMap.vibrancy.low[Math.floor(Math.random() * dnaMap.vibrancy.low.length)]);
  }

  if (insights?.tone_manner) {
    const tm = insights.tone_manner;
    if (tm.temperature === 'warm') keywords.add(dnaMap.temperature.warm[Math.floor(Math.random() * dnaMap.temperature.warm.length)]);
    if (tm.temperature === 'cool') keywords.add(dnaMap.temperature.cool[Math.floor(Math.random() * dnaMap.temperature.cool.length)]);
  }

  // Add idea keywords but filtered
  if (idea) {
    const ideaKeywords = mapToEnglish(idea);
    if (ideaKeywords) ideaKeywords.split(',').forEach(k => keywords.add(k));
  }

  // Fallback
  if (keywords.size === 0) {
    return "Minimalist architecture,Modern abstract sculpture,Soft organic form";
  }

  return Array.from(keywords).join(',');
}

export async function updateMoodboard(insights: any, options: string[], idea: string): Promise<{ images: UnsplashImage[], query: string }> {
  const query = getKeywordsFromDNA(insights, options, idea);
  const images = await searchUnsplashImages(query);
  
  // Save to localStorage
  localStorage.setItem('moodboard_data', JSON.stringify({
    images,
    query,
    timestamp: Date.now()
  }));

  return { images, query };
}

export function getKeywordsFromHistory(history: any[]): string {
  if (!history || history.length === 0) return "";

  const keywords = new Set<string>();
  const recentItems = history.slice(0, 5);
  
  recentItems.forEach(item => {
    const insights = item.insights?.visual_balance;
    if (insights) {
      // Map DNA values to the requested high-end design keywords
      if (insights.minimalism > 50) keywords.add("Minimalist architecture");
      if (insights.modernity > 50) keywords.add("Modern abstract sculpture");
      if (insights.geometry < 50 || item.options?.includes('Soft Volume')) keywords.add("Soft organic form");
    }
  });

  // Fallback to the requested defaults if no specific DNA is found
  if (keywords.size === 0) {
    return "Minimalist architecture,Modern abstract sculpture,Soft organic form";
  }

  return Array.from(keywords).join(',');
}
