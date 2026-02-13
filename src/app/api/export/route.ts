import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';

// POST: Word-Dokument generieren
export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }

    // Projekt und Insights laden
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    const { data: insights } = await supabaseAdmin
      .from('insights')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    const { data: conversations } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    // Dokument erstellen
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Titel
          new Paragraph({
            text: 'STRATEGISCHES BRIEFING',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          new Paragraph({
            text: project?.customer_name || 'Unbekannter Kunde',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),

          new Paragraph({
            text: `Projekttyp: ${getProjectTypeName(project?.project_type)}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // 1. ZUSAMMENFASSUNG
          new Paragraph({
            text: '1. ZUSAMMENFASSUNG',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: generateSummary(insights, conversations),
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),

          // 2. MARKENANALYSE
          new Paragraph({
            text: '2. MARKENANALYSE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateInsightsSection(insights, 'brand_values'),

          // 3. ZIELGRUPPE
          new Paragraph({
            text: '3. ZIELGRUPPE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateInsightsSection(insights, 'target_audience'),

          // 4. WETTBEWERBSANALYSE
          new Paragraph({
            text: '4. WETTBEWERBSANALYSE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateInsightsSection(insights, 'competitors'),

          // 5. ZIELFORMULIERUNG
          new Paragraph({
            text: '5. ZIELFORMULIERUNG (Single-Minded-Proposition)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateInsightsSection(insights, 'goals'),

          // 6. USP-EXTRACTION
          new Paragraph({
            text: '6. USP-EXTRAKTION',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateInsightsSection(insights, 'usp'),

          // 7. TOUCHPOINT-STRATEGIE
          new Paragraph({
            text: '7. TOUCHPOINT-STRATEGIE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateInsightsSection(insights, 'touchpoints'),

          // 8. ASSET-ROADMAP
          new Paragraph({
            text: '8. ASSET-ROADMAP',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            text: 'Basierend auf dem Briefing werden folgende Assets empfohlen:',
            spacing: { after: 200 }
          }),

          ...generateAssetRecommendations(project?.project_type),

          // 9. UMSETZUNGSANLEITUNG
          new Paragraph({
            text: '9. UMSETZUNGSANLEITUNG FÜR DAS STADTHIRSCH-TEAM',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateImplementationGuide(project?.project_type),

          // 10. CHECKLISTE
          new Paragraph({
            text: '10. QUALITÄTS-CHECKLISTE',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          ...generateChecklist(project?.project_type),

          // Footer
          new Paragraph({
            text: '',
            spacing: { before: 600 }
          }),

          new Paragraph({
            text: `Generiert am ${new Date().toLocaleDateString('de-CH')} durch StadtHirsch KI-Briefing-System`,
            alignment: AlignmentType.CENTER,
            italics: true
          })
        ]
      }]
    });

    // Dokument als Buffer
    const buffer = await Packer.toBuffer(doc);
    
    // In R2 speichern (optional) oder direkt zurückgeben
    const fileName = `Briefing_${project?.customer_name?.replace(/\s+/g, '_')}_${Date.now()}.docx`;

    // Speichern in Supabase Storage (falls konfiguriert)
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

    let fileUrl = null;
    
    if (!uploadError && uploadData) {
      const { data: urlData } = await supabaseAdmin
        .storage
        .from('documents')
        .createSignedUrl(fileName, 60 * 60 * 24); // 24 Stunden gültig
      
      fileUrl = urlData?.signedUrl;
    }

    // Dokument-Eintrag erstellen
    await supabaseAdmin.from('documents').insert({
      project_id: projectId,
      file_name: fileName,
      file_url: fileUrl,
      version: 1
    });

    // Status aktualisieren
    await supabaseAdmin
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', projectId);

    // Buffer als Response zurückgeben
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}

// Hilfsfunktionen
function getProjectTypeName(type: string | null): string {
  const names: Record<string, string> = {
    ci: 'Corporate Identity & Branding',
    logo: 'Logo-Entwicklung',
    bildwelt: 'Bildwelt-Entwicklung',
    piktogramme: 'Piktogramm-Systeme',
    social: 'Social Media Content'
  };
  return names[type || ''] || 'Unbestimmt';
}

function generateSummary(insights: any[] | null, conversations: any[] | null): string {
  // Einfache Zusammenfassung aus Gesprächsinhalten
  const keyPoints = insights?.slice(0, 3).map(i => i.content).join('. ') || '';
  return `Dieses strategische Briefing wurde auf Basis eines interaktiven Gesprächs erstellt. ${keyPoints}`;
}

function generateInsightsSection(insights: any[] | null, category: string): Paragraph[] {
  const categoryInsights = insights?.filter(i => i.category === category) || [];
  
  if (categoryInsights.length === 0) {
    return [new Paragraph({ text: 'Keine Daten vorhanden.', spacing: { after: 200 } })];
  }

  return categoryInsights.map(insight => 
    new Paragraph({
      children: [
        new TextRun({ text: '• ', bold: true }),
        new TextRun(insight.content)
      ],
      spacing: { after: 150 },
      bullet: { level: 0 }
    })
  );
}

function generateAssetRecommendations(caseType: string | null): Paragraph[] {
  const recommendations: Record<string, string[]> = {
    ci: [
      'Logo-Varianten (Standard, Negativ, Schwarz-Weiss)',
      'Farbdefinitionsdokument (Primär- und Sekundärfarben)',
      'Typografie-Richtlinien',
      'Anwendungsbeispiele (Briefpapier, Visitenkarten)',
      'Icon-System (falls benötigt)',
      'Fotografie-Richtlinien'
    ],
    logo: [
      'Logo-Entwürfe (3-5 Varianten)',
      'Logo-Abwandlungen (für verschiedene Medien)',
      'Schutzzonen-Definition',
      'Mindestgrössen-Definition',
      'Anwendungsbeispiele',
      'Styleguide-Auszug'
    ],
    bildwelt: [
      'Moodboards (3-5 Richtungen)',
      'Beispielbilder pro Kategorie',
      'Fotografie-Richtlinien',
      'Bildbearbeitungs-Vorgaben',
      'Lizenz-Empfehlungen'
    ],
    piktogramme: [
      'Icon-Set (20-50 Icons)',
      'Grid-System-Dokumentation',
      'Strichstärken-Definition',
      'Farb-Anwendung',
      'Animations-Vorgaben (falls relevant)'
    ],
    social: [
      'Content-Kalender (2-4 Wochen)',
      'Post-Templates (3-5 Varianten)',
      'Story-Templates',
      'Hashtag-Strategie',
      'Caption-Vorlagen'
    ]
  };

  const items = recommendations[caseType || ''] || recommendations.ci;
  
  return items.map(item => 
    new Paragraph({
      children: [
        new TextRun({ text: '□ ', bold: true }),
        new TextRun(item)
      ],
      spacing: { after: 100 }
    })
  );
}

function generateImplementationGuide(caseType: string | null): Paragraph[] {
  const guides: Record<string, string[]> = {
    ci: [
      '1. Zuerst das Markenfundament festlegen (Werte, Positionierung)',
      '2. Logo-System entwickeln und testen',
      '3. Farbwelt definieren (Kontrastprüfung durchführen)',
      '4. Typografie festlegen (Lizenzen klären)',
      '5. Anwendungsbeispiele erstellen',
      '6. Qualitätskontrolle: Alle Assets im kleinsten Einsatz testen'
    ],
    logo: [
      '1. Bestehende Website analysieren (Farben, Stil)',
      '2. 3-5 Logo-Konzepte skizzieren',
      '3. Mit Kunden auswählen und iterieren',
      '4. Finale Varianten ausarbeiten',
      '5. Schutzzonen und Mindestgrössen definieren',
      '6. Qualitätskontrolle: In Schwarz-Weiss und klein testen'
    ],
    bildwelt: [
      '1. Bestehende Bilder analysieren (Stil, Farbe, Licht)',
      '2. Moodboards erstellen (3-5 Richtungen)',
      '3. Mit Kunden abstimmen',
      '4. Beispielbilder suchen/erstellen',
      '5. Richtlinien dokumentieren',
      '6. Qualitätskontrolle: Konsistenz prüfen'
    ],
    piktogramme: [
      '1. Bestehende Icons analysieren (Outline/Filled)',
      '2. Grid-System definieren',
      '3. Kern-Icons entwickeln (Home, Suche, Profil)',
      '4. Vollständiges Set erstellen',
      '5. In verschiedenen Grössen testen',
      '6. Qualitätskontrolle: Lesbarkeit bei 16px prüfen'
    ],
    social: [
      '1. Content-Pillars definieren (3-5 Themen)',
      '2. Redaktionsplan erstellen',
      '3. Templates designen',
      '4. Beispiel-Content erstellen',
      '5. Mit Kunden abstimmen',
      '6. Qualitätskontrolle: Engagement-Optimierung'
    ]
  };

  const items = guides[caseType || ''] || guides.ci;
  
  return items.map(item => 
    new Paragraph({
      text: item,
      spacing: { after: 150 }
    })
  );
}

function generateChecklist(caseType: string | null): Paragraph[] {
  const checklists: Record<string, string[]> = {
    ci: [
      'Logo funktioniert in Schwarz-Weiss',
      'Farben haben ausreichend Kontrast (WCAG 4.5:1)',
      'Typografie ist lizenziert',
      'Alle Touchpoints berücksichtigt',
      'Markenwerte sind konsistent umgesetzt'
    ],
    logo: [
      'Logo ist in klein (16px Favicon) erkennbar',
      'Schutzzone wird eingehalten',
      'Alle Varianten vorhanden (Standard, Negativ, Monochrom)',
      'Keine Verzerrung oder Effekte',
      'Dateiformate: SVG, PNG, PDF vorhanden'
    ],
    bildwelt: [
      'Stimmung ist konsistent',
      'Farben passen zur Marken-CI',
      'Lizenzen sind geklärt',
      'Diversity ist abgebildet',
      'Bilder funktionieren mit Text-Overlay'
    ],
    piktogramme: [
      'Icons sind bei 16px noch erkennbar',
      'Strichstärke ist konsistent',
      'Grid-System eingehalten',
      'Alle Icons haben gleichen visuellen Schwerpunkt',
      'Dark-Mode-Varianten vorhanden'
    ],
    social: [
      'Texte sind kurz und pointiert',
      'CTAs sind klar',
      'Hashtags sind recherchiert',
      'Bildformate passen zu Plattformen',
      'Redaktionsplan ist realistisch'
    ]
  };

  const items = checklists[caseType || ''] || checklists.ci;
  
  return items.map(item => 
    new Paragraph({
      children: [
        new TextRun({ text: '☐ ', bold: true }),
        new TextRun(item)
      ],
      spacing: { after: 100 }
    })
  );
}
