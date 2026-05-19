import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return Response.json({ error: 'leadId required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return Response.json({ conversations: data })
  } catch (error) {
    console.error('Conversations GET error:', error)
    return Response.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
