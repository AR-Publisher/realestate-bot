import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ leads: data })
  } catch (error) {
    console.error('Leads GET error:', error)
    return Response.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Leads DELETE error:', error)
    return Response.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
