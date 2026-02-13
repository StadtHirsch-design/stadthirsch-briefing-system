import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Einfacher HTML-Parser ohne cheerio (vermeidet webpack Issues)
function extractFromHTML(html: string) {
  // Title extrahieren
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Meta keywords
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                       html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']keywords["'][^>]*>/i);
  const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()).filter(Boolean) : [];
  
  // Content aus main/article extrahieren (vereinfacht)
  const contentMatch = html.match(/<(main|article|div class=["']content["']|div id=["']content["'])[^>]*>([\s\S]*?)<\/\1>/i);
  let content = '';
  if (contentMatch) {
    // HTML-Tags entfernen
    content = contentMatch[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 2000);
  }
  
  // Farben extrahieren (aus style-Attributen)
  const colors = new Set<string>();
  const colorMatches = html.matchAll(/#[a-fA-F0-9]{6}/g);
  for (const match of colorMatches) {
    colors.add(match[0].toLowerCase());
    if (colors.size >= 10) break; // Max 10 Farben
  }
  
  // Bilder zählen
  const imgMatches = html.match(/<img/g);
  const imageCount = imgMatches ? imgMatches.length : 0;
  
  // Logo erkennen
  const hasLogo = html.match(/(logo|brand)[^>]*\.(png|jpg|svg|gif)/i) !== null ||
                  html.match(/class=["'][^"']*logo[^"']*["']/i) !== null;
  
  return {
    title,
    description,
    keywords,
    content_preview: content,
    colors: Array.from(colors),
    image_count: imageCount,
    has_logo: hasLogo
  };
}

// POST: Website crawlen und analysieren
export async function POST(request: NextRequest) {
  try {
    const { projectId, url } = await request.json();

    if (!projectId || !url) {
      return NextResponse.json({ error: 'Project ID and URL required' }, { status: 400 });
    }

    // URL validieren
    let validatedUrl: string;
    try {
      const parsed = new URL(url);
      validatedUrl = parsed.toString();
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Website crawlen
    const response = await fetch(validatedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StadtHirschBot/1.0; +https://stadthirsch.ch)'
      },
      signal: AbortSignal.timeout(10000) // 10s Timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not fetch website: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    
    // HTML parsen
    const analysis = extractFromHTML(html);
    
    // Fallback wenn kein Content gefunden
    if (!analysis.content_preview) {
      // Versuche Body-Content
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        analysis.content_preview = bodyMatch[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 2000);
      }
    }

    // Als Insights speichern
    await supabaseAdmin.from('insights').insert({
      project_id: projectId,
      category: 'brand_values',
      content: `Website-Analyse: ${analysis.title}. ${analysis.description}`.slice(0, 500),
      confidence: 0.8
    });

    await supabaseAdmin.from('insights').insert({
      project_id: projectId,
      category: 'touchpoints',
      content: `Website: ${url}. Farben: ${analysis.colors.slice(0, 5).join(', ')}. Bilder: ${analysis.image_count}`,
      confidence: 0.9
    });

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}

// GET: Competitor-Recherche (via Brave API)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    const braveApiKey = process.env.BRAVE_API_KEY;
    
    if (!braveApiKey) {
      return NextResponse.json(
        { error: 'Brave API key not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          'X-Subscription-Token': braveApiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Brave API error: ${response.status}`);
    }

    const data = await response.json();
    
    const competitors = data.web?.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      description: r.description
    })) || [];

    return NextResponse.json({ competitors });

  } catch (error) {
    console.error('Competitor research error:', error);
    return NextResponse.json(
      { error: 'Research failed. Please try again later.' },
      { status: 500 }
    );
  }
}
