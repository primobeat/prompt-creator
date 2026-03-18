/**
 * Image Source Service (Aggregating Unsplash, Lorem Picsum, and simulated Pexels/Pixabay)
 */

export interface ImageResult {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  source: 'Unsplash' | 'Pexels' | 'Pixabay' | 'Lorem Picsum';
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

// Concept to English Query Mapping
const CONCEPT_QUERIES: Record<string, string> = {
  'Minimalism': 'Minimalist aesthetic object, zen, pure form',
  'Artistic': 'Artistic sculpture, museum gallery, unique object',
  'Geometry': 'Geometric 3D shapes, architectural form, symmetry',
  'Abstract': 'Abstract organic art, ethereal textures, non-representational',
  'Futuristic': 'Futuristic design, sleek metallic, cyberpunk aesthetic',
  'Experimental': 'Experimental avant-garde art, liquid metal, glitch design'
};

const QUALITY_SUFFIX = "Fine art photography, Editorial style, Cinematic lighting";

const DESIGN_POOLS: Record<string, string[]> = {
  minimalist: [
    'photo-1486406146926-c627a92ad1ab', 'photo-1494438639942-882ba9927e26', 'photo-1518005020951-eccb494ad742',
    'photo-1503387762-592dea58ef23', 'photo-1487958449943-2429e8be8625', 'photo-1511467687858-23d96c32e4ae',
    'photo-1508333706533-1ab43ecb1606', 'photo-1518780664697-55e3ad937233', 'photo-1493397212122-2b85dda8106b'
  ],
  artistic: [
    'photo-1547826039-adc3a4a76fe8', 'photo-1513519245088-0e12902e5a38', 'photo-1505330622279-bf7d7fc918f4',
    'photo-1554188248-986adbb73be4', 'photo-1549490349-8643362247b5', 'photo-1518780664697-55e3ad937233',
    'photo-1561839561-b13bcfe95249', 'photo-1550684848-fac1c5b4e853', 'photo-1515895309288-a3815ab7cf81'
  ],
  geometric: [
    'photo-1518005020951-eccb494ad742', 'photo-1503387762-592dea58ef23', 'photo-1486406146926-c627a92ad1ab',
    'photo-1494438639942-882ba9927e26', 'photo-1508333706533-1ab43ecb1606', 'photo-1511467687858-23d96c32e4ae',
    'photo-1493397212122-2b85dda8106b', 'photo-1507652313519-d451e12d596d', 'photo-1449156003053-c30670b9a130'
  ],
  abstract: [
    'photo-1541701494587-cb58502866ab', 'photo-1550684848-fac1c5b4e853', 'photo-1515895309288-a3815ab7cf81',
    'photo-1504333638930-c8787321eee0', 'photo-1557683316-973673baf926', 'photo-1557682250-33bd709cbe85',
    'photo-1557682224-5b8590cd9ec5', 'photo-1525909002-1b05e0c869d8', 'photo-1513151233558-d860c5398176'
  ],
  futuristic: [
    'photo-1518770660439-4636190af475', 'photo-1550751827-4bd374c3f58b', 'photo-1525547719571-a2d4ac8945e2',
    'photo-1531297484001-80022131f5a1', 'photo-1519389950473-47ba0277781c', 'photo-1485827404703-89b55fcc595e',
    'photo-1451187580459-43490279c0fa', 'photo-1504384308090-c894fdcc538d', 'photo-1518770660439-4636190af475'
  ],
  experimental: [
    'photo-1550684848-fac1c5b4e853', 'photo-1515895309288-a3815ab7cf81', 'photo-1504333638930-c8787321eee0',
    'photo-1557683316-973673baf926', 'photo-1557682250-33bd709cbe85', 'photo-1557682224-5b8590cd9ec5',
    'photo-1525909002-1b05e0c869d8', 'photo-1513151233558-d860c5398176', 'photo-1492691527719-9d1e07e534b4'
  ]
};

export async function searchImages(query: string, perPage: number = 24): Promise<ImageResult[]> {
  const results: ImageResult[] = [];
  const tags = query.toLowerCase().split(',').map(t => t.trim());
  
  // Determine concept
  let conceptKey = 'minimalist';
  if (tags.some(t => t.includes('artistic'))) conceptKey = 'artistic';
  else if (tags.some(t => t.includes('geometric'))) conceptKey = 'geometric';
  else if (tags.some(t => t.includes('abstract'))) conceptKey = 'abstract';
  else if (tags.some(t => t.includes('futuristic'))) conceptKey = 'futuristic';
  else if (tags.some(t => t.includes('experimental'))) conceptKey = 'experimental';

  const pool = DESIGN_POOLS[conceptKey] || DESIGN_POOLS.minimalist;
  const sources: ('Unsplash' | 'Pexels' | 'Pixabay' | 'Lorem Picsum')[] = ['Unsplash', 'Pexels', 'Pixabay', 'Lorem Picsum'];

  for (let i = 0; i < perPage; i++) {
    const source = sources[i % sources.length];
    const seed = Math.floor(Math.random() * 10000) + i;
    const photoId = pool[i % pool.length];
    
    let imageUrl = '';
    
    if (source === 'Unsplash') {
      imageUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=1200&q=80&sig=${seed}`;
    } else if (source === 'Lorem Picsum') {
      imageUrl = `https://picsum.photos/seed/${seed}/800/1200`;
    } else {
      // For Pexels and Pixabay, we use LoremFlickr which pulls from various sources
      const keyword = tags[0] || 'design';
      imageUrl = `https://loremflickr.com/800/1200/${encodeURIComponent(keyword)}?lock=${seed}`;
    }

    results.push({
      id: `${source}-${seed}`,
      urls: {
        regular: imageUrl,
        small: imageUrl,
        thumb: imageUrl,
      },
      alt_description: `${conceptKey} aesthetic reference`,
      source: source,
      user: {
        name: `${source} Community`,
        links: {
          html: "#",
        },
      },
    });
  }

  return results.sort(() => Math.random() - 0.5);
}

export function getMoodboardQuery(options: string[], idea: string): string {
  const activeConcepts = options.filter(opt => CONCEPT_QUERIES[opt]);
  
  // Prioritize the first selected concept
  const primaryConcept = activeConcepts[0] || 'Minimalism';
  const baseQuery = CONCEPT_QUERIES[primaryConcept];
  
  // Combine with quality suffix
  return `${baseQuery}, ${QUALITY_SUFFIX}`;
}
