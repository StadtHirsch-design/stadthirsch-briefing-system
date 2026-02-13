import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as cheerio from 'cheerio';

// POST: Website crawlen und analysieren
export async function POST(request: NextRequest) {
  try {
    const { projectId, url } = await request.json();

    if (!projectId || !url) {
      return NextResponse.json({ error: 'Project ID and URL required' }, { status: 400 });
    }

    // Website crawlen
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StadtHirschBot/1.0)'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Could not fetch website' },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extrahieren
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Hauptinhalt
    const content = $('main, article, .content, #content')
      .text()
      .replace(/\s+/g, ' ')
      .slice(0, 2000);

    // Farben extrahieren (aus Inline-Styles)
    const colors = new Set<string>();
    $('[style*="color"], [style*="background"]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const colorMatch = style.match(/#[a-fA-F0-9]{6}/);
      if (colorMatch) colors.add(colorMatch[0]);
    });

    // Bilder zählen
    const imageCount = $('img').length;

    // Analyse-Ergebnis
    const analysis = {
      title,
      description,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      content_preview: content,
      colors: Array.from(colors),
      image_count: imageCount,
      has_logo: $('img[src*="logo"], .logo, #logo').length > 0,
      crawled_at: new Date().toISOString()
    };

    // Als Insight speichern
    await supabaseAdmin.from('insights').insert({
      project_id: projectId,
      category: 'brand_values',
      content: `Website-Analyse: ${title}. ${description}`,
      confidence: 0.8
    });

    await supabaseAdmin.from('insights').insert({
      project_id: projectId,
      category: 'touchpoints',
      content: `Bestehende Website: ${url}. Farben: ${analysis.colors.join(', ')}. Bilder: ${imageCount}`,
      confidence: 0.9
    });

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
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
    
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          'X-Subscription-Token': braveApiKey || '',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Brave API error');
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
      { error: 'Research failed' },
      { status: 500 }
    );
  }
}
