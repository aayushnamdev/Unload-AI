
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config()

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const FOCUS_MODE_PROMPT = `You are the "Focus Mode" engine. The user is doing a "Cognitive Dump" for TODAY.
Your goal is to extract actionable tasks and ruthlessly prioritize them into exactly two categories:
1. **Top 3**: The 3 most critical, high-impact tasks for *today*.
2. **Bench**: Everything else that *could* be done today but is lower priority.

## Input Analysis
- **Transmute**: Convert vague thoughts into actionable tasks (start with a verb).
- **Ignore**: Venting, emotional processing, or psychology. Just extract the *task* if there is one.
- **Decompose**: If a task is huge ("Write book"), break it down to the immediate next step.

## prioritizing Logic
- **Top 3**: Must be urgent, high-value, or blocking other things.
- **Bench**: Nice-to-haves, administrative, or less urgent.

## Output Format
Return a JSON object with this EXACT structure:

\`\`\`json
{
  "top_3": [
    {
      "title": "Actionable Title",
      "description": "Short context",
      "estimated_time": "15m",
      "type": "task"
    }
  ],
  "bench": [
    {
      "title": "Actionable Title",
      "description": "Short context",
      "estimated_time": "30m",
      "type": "task"
    }
  ]
}
\`\`\`
`

async function main() {
    const input = "Review Project Plan"
    console.log("Testing extraction with input:", input)

    try {
        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022', // Trying specific October 2024 ID
            max_tokens: 4096,
            temperature: 0.1,
            system: FOCUS_MODE_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Please process this thought dump and return the JSON:\n\n${input}`,
                },
            ],
        })

        const textContent = message.content.find((block) => block.type === 'text')
        // @ts-ignore
        const responseText = textContent?.text.trim() || ""

        console.log("Raw Response:\n", responseText)

        // Remove markdown code blocks if present
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
        const jsonText = jsonMatch ? jsonMatch[1] : responseText

        const result = JSON.parse(jsonText)
        console.log("Parsed JSON:", JSON.stringify(result, null, 2))

    } catch (error) {
        console.error("Extraction Failed:", error)
    }
}

main()
