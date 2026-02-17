import Anthropic from '@anthropic-ai/sdk'
import { FOCUS_MODE_PROMPT, CONTEXT_PROMPT } from './prompts/extraction'
import { ExtractionResponse } from '@/types/ai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ClaudeExtractionOptions {
  content: string
  recentContext?: string
  systemPrompt?: string
}

export async function extractItemsFromDump(
  options: ClaudeExtractionOptions
): Promise<ExtractionResponse> {
  const { content, recentContext, systemPrompt } = options

  // Build the system prompt with context if available
  let promptToUse = systemPrompt || FOCUS_MODE_PROMPT
  if (recentContext) {
    promptToUse += '\n\n' + CONTEXT_PROMPT(recentContext)
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048, // sufficient for JSON output from ~10 min of speech
      temperature: 0.1,
      system: promptToUse,
      messages: [
        {
          role: 'user',
          content: `Please process this thought dump and return the JSON:\n\n${content}`,
        },
      ],
    })

    // Extract the text content from Claude's response
    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response')
    }

    // Parse the JSON response
    const responseText = textContent.text.trim()

    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
    const jsonText = jsonMatch ? jsonMatch[1] : responseText

    const extractionResult: ExtractionResponse = JSON.parse(jsonText)

    return extractionResult
  } catch (error: any) {
    console.error('Claude extraction error:', error)

    // Check for specific API errors
    if (error.status === 401) {
      throw new Error('Invalid Anthropic API key')
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.')
    } else if (error.status === 529) {
      throw new Error('Anthropic API is temporarily overloaded. Please try again.')
    }

    // If we got a response but couldn't parse it, provide more details
    if (error instanceof SyntaxError) {
      console.error('Failed to parse Claude response as JSON:', error)
      throw new Error('Failed to parse AI response. Please try again.')
    }

    throw error
  }
}

export interface ClarityGenerationOptions {
  activeItems: Array<{
    id: string
    title: string
    type: string
    priority: string
    effort_level: string
    suggested_next_step?: string
    original_fragment?: string
  }>
  emotionalContext?: string
  userId: string
}

export async function generateDailyClarity(
  options: ClarityGenerationOptions
): Promise<{
  morning_message: string
  focus_items: string[]
  parked_suggestions: string[]
  dropped_suggestions: string[]
  emotional_context?: string
}> {
  const { activeItems, emotionalContext } = options

  if (activeItems.length === 0) {
    return {
      morning_message: "Take a breath. You have nothing urgent today. Enjoy this moment of calm.",
      focus_items: [],
      parked_suggestions: [],
      dropped_suggestions: [],
    }
  }

  const systemPrompt = `You are MindClear's daily clarity engine. Your role is to help users focus on what truly matters each day.

## Your Mission

Transform an overwhelming list of items into a calm, focused daily plan with exactly 3 focus items.

## Guidelines

1. **Morning Message**: Create a warm, human greeting that acknowledges their current state
   - Reference their emotional context if provided
   - Set a calm, focused tone for the day
   - Be encouraging but realistic
   - Keep it to 2-3 sentences

2. **Focus Items**: Select exactly 3 items that matter most TODAY
   - Consider urgency (deadlines, time-sensitivity)
   - Balance high-priority items with quick wins
   - Mix effort levels when possible (don't stack all large items)
   - Prefer items with clear next steps
   - If fewer than 3 items exist, that's fine

3. **Park Suggestions**: Items that can wait
   - Not urgent today
   - No immediate deadline
   - Can be handled later this week

4. **Drop Suggestions**: Items that might not be worth doing
   - No longer relevant
   - Unrealistic expectations
   - Not aligned with current priorities
   - User might be holding onto out of guilt

## Output Format

Return a JSON object:
\`\`\`json
{
  "morning_message": "Warm, human greeting (2-3 sentences)",
  "focus_items": ["item_id_1", "item_id_2", "item_id_3"],
  "parked_suggestions": ["item_id_x", "item_id_y"],
  "dropped_suggestions": ["item_id_z"],
  "emotional_context": "Brief note on detected emotional pattern (optional)"
}
\`\`\`

Remember: Less is more. Better to have 1-2 well-chosen focus items than to overwhelm with 3 mediocre ones.`

  try {
    const itemsList = activeItems
      .map(
        (item, idx) =>
          `${idx + 1}. [${item.id}] ${item.title}
   Type: ${item.type} | Priority: ${item.priority} | Effort: ${item.effort_level}
   ${item.suggested_next_step ? `Next step: ${item.suggested_next_step}` : ''}
   ${item.original_fragment ? `Context: "${item.original_fragment}"` : ''}`
      )
      .join('\n\n')

    const userMessage = `Here are the user's active items:\n\n${itemsList}\n\n${emotionalContext ? `Recent emotional context: ${emotionalContext}\n\n` : ''
      }Please generate today's clarity focus.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response')
    }

    const responseText = textContent.text.trim()
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
    const jsonText = jsonMatch ? jsonMatch[1] : responseText

    return JSON.parse(jsonText)
  } catch (error: any) {
    console.error('Clarity generation error:', error)
    throw new Error('Failed to generate daily clarity')
  }
}
