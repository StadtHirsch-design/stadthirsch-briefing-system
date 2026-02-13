import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { customer_name, customer_email, project_type } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        customer_name: customer_name || 'Neues Projekt',
        customer_email,
        project_type,
        status: 'briefing'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
