import { supabase } from '@/lib/supabase'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const SYSTEM_PROMPT = `You are Aria, a friendly and professional AI property consultant for a real estate agency in Pakistan. Your job is to help leads find their perfect property.

Your goals:
1. Collect these pieces of information naturally in conversation (don't ask all at once):
   - Full name
   - Email address
   - Budget (in PKR)
   - Location preference (city/area)
   - Number of bedrooms
   - Buy or Rent
   - Timeline (ready now / 3-6 months / just browsing)

2. Once you have enough info, search for matching properties.

3. Classify leads:
   - HOT: ready now, budget is realistic
   - WARM: 3-6 months timeline
   - COLD: just browsing or very vague

4. Handle edge cases:
   - If budget seems too low for desired area, gently suggest alternatives or budget adjustment
   - If request is vague ("show me good houses"), ask specific qualifying questions first
   - Always be warm, professional, and helpful

5. When presenting properties, always give a fit score (0-100) and explain why in plain English.

IMPORTANT RULES:
- Never ask more than 2 questions at once
- If lead changes their mind, update their info smoothly
- Always respond in valid JSON format with this EXACT structure (no markdown, no backticks, just raw JSON):
{
  "message": "your conversational response to the user",
  "leadData": {
    "name": null,
    "email": null,
    "phone": null,
    "budget": null,
    "location_preference": null,
    "bedrooms": null,
    "deal_type": null,
    "timeline": null,
    "classification": "Cold"
  },
  "searchProperties": false,
  "dataComplete": false
}

Rules for leadData:
- Keep ALL previously collected fields — never lose data
- budget must be a number (e.g. 150000) or null
- bedrooms must be a number (e.g. 3) or null
- deal_type must be exactly "buy" or "rent" or null
- classification must be exactly "Hot", "Warm", or "Cold"
- Set searchProperties to true when you have budget, location_preference, bedrooms, and deal_type
- Set dataComplete to true when you have name, email, and all property preferences`

export async function POST(request) {
  try {
    const { messages, leadId, currentLeadData } = await request.json()

    // Build conversation history for Gemini
    const geminiContents = []

    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }

    // Build system instruction with current lead data context
    const systemInstruction = SYSTEM_PROMPT +
      (currentLeadData && Object.keys(currentLeadData).length > 0
        ? `\n\nCurrent lead data collected so far (keep all this info, only update what changes): ${JSON.stringify(currentLeadData)}`
        : '')

    // Call Gemini API
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json'
          }
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', errText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const geminiData = await response.json()

    // Extract text from Gemini response
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let aiResponse
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      aiResponse = JSON.parse(cleaned)
    } catch (e) {
      console.error('JSON parse error:', e, 'Raw text:', rawText)
      aiResponse = {
        message: rawText || "I'm here to help you find the perfect property! Could you tell me your name?",
        leadData: currentLeadData || {},
        searchProperties: false,
        dataComplete: false
      }
    }

    let matchedProperties = []
    let updatedLeadId = leadId

    // Search for properties if we have enough info
    if (aiResponse.searchProperties && aiResponse.leadData) {
      matchedProperties = await findMatchingProperties(aiResponse.leadData)
    }

    // Save or update lead in database
    if (
      aiResponse.leadData &&
      (aiResponse.leadData.name || aiResponse.leadData.email || aiResponse.leadData.budget)
    ) {
      updatedLeadId = await saveOrUpdateLead(leadId, aiResponse.leadData)
    }

    // Save conversation messages to Supabase
    if (updatedLeadId) {
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage && lastUserMessage.role === 'user') {
        await supabase.from('conversations').insert({
          lead_id: updatedLeadId,
          role: 'user',
          content: lastUserMessage.content
        })
      }

      await supabase.from('conversations').insert({
        lead_id: updatedLeadId,
        role: 'assistant',
        content: aiResponse.message
      })
    }

    return Response.json({
      message: aiResponse.message,
      leadData: aiResponse.leadData,
      properties: matchedProperties,
      leadId: updatedLeadId,
      dataComplete: aiResponse.dataComplete
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      {
        error: 'Something went wrong.',
        message: "I'm sorry, I encountered an issue. Could you please try again?"
      },
      { status: 500 }
    )
  }
}

async function findMatchingProperties(leadData) {
  try {
    let query = supabase.from('properties').select('*')

    if (leadData.deal_type) {
      query = query.eq('type', leadData.deal_type)
    }

    if (leadData.bedrooms) {
      query = query
        .gte('bedrooms', Number(leadData.bedrooms) - 1)
        .lte('bedrooms', Number(leadData.bedrooms) + 1)
    }

    const { data: properties, error } = await query

    if (error || !properties) return []

    const scored = properties.map(property => {
      let score = 50
      let reasons = []
      let penalties = []

      if (leadData.budget) {
        const budget = Number(leadData.budget)
        const price = Number(property.price)
        const diff = Math.abs(price - budget) / budget

        if (diff <= 0.05) { score += 30; reasons.push('price is a perfect match') }
        else if (diff <= 0.15) { score += 20; reasons.push('price is within your budget') }
        else if (diff <= 0.30) { score += 10; reasons.push('price is close to your budget') }
        else if (price > budget * 1.3) { score -= 20; penalties.push('price exceeds your budget') }
        else if (price < budget * 0.5) { score += 5; reasons.push('well within budget') }
      }

      if (leadData.location_preference) {
        const prefLower = leadData.location_preference.toLowerCase()
        const locLower = property.location.toLowerCase()
        if (locLower.includes(prefLower) || prefLower.includes(locLower.split(' ')[0])) {
          score += 15; reasons.push('location matches your preference')
        } else if (locLower.includes('lahore') && prefLower.includes('lahore')) {
          score += 8; reasons.push('same city as your preference')
        }
      }

      if (leadData.bedrooms) {
        if (property.bedrooms === Number(leadData.bedrooms)) {
          score += 5; reasons.push(`exact ${leadData.bedrooms}-bedroom match`)
        }
      }

      score = Math.max(0, Math.min(100, score))

      let fitExplanation = ''
      if (score >= 80) fitExplanation = `Excellent match! ${reasons.join(', ')}.`
      else if (score >= 60) fitExplanation = `Good fit — ${reasons.join(', ')}.${penalties.length ? ' Note: ' + penalties.join(', ') + '.' : ''}`
      else if (score >= 40) fitExplanation = `Partial match — ${reasons.length ? reasons.join(', ') + '.' : ''} ${penalties.length ? 'However, ' + penalties.join(', ') + '.' : ''}`
      else fitExplanation = `May not be ideal — ${penalties.join(', ')}.`

      return { ...property, fitScore: score, fitExplanation }
    })

    return scored.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3)

  } catch (error) {
    console.error('Property search error:', error)
    return []
  }
}

async function saveOrUpdateLead(leadId, leadData) {
  try {
    const cleanData = {}
    if (leadData.name) cleanData.name = leadData.name
    if (leadData.email) cleanData.email = leadData.email
    if (leadData.phone) cleanData.phone = leadData.phone
    if (leadData.budget) cleanData.budget = Number(leadData.budget)
    if (leadData.location_preference) cleanData.location_preference = leadData.location_preference
    if (leadData.bedrooms) cleanData.bedrooms = Number(leadData.bedrooms)
    if (leadData.deal_type) cleanData.deal_type = leadData.deal_type
    if (leadData.timeline) cleanData.timeline = leadData.timeline
    if (leadData.classification) cleanData.classification = leadData.classification
    cleanData.updated_at = new Date().toISOString()

    if (leadId) {
      const { data, error } = await supabase
        .from('leads')
        .update(cleanData)
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error
      return data.id
    } else {
      const { data, error } = await supabase
        .from('leads')
        .insert(cleanData)
        .select()
        .single()

      if (error) throw error
      return data.id
    }
  } catch (error) {
    console.error('Save lead error:', error)
    return leadId
  }
}