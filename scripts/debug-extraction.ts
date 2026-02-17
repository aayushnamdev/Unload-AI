
import dotenv from 'dotenv'
import { extractItemsFromDump } from '../src/lib/ai/claude'
import { FOCUS_MODE_PROMPT } from '../src/lib/ai/prompts/extraction'

dotenv.config()

async function main() {
    const input = "Review Project Plan"
    console.log("Testing extraction with input:", input)

    try {
        const result = await extractItemsFromDump({
            content: input,
            systemPrompt: FOCUS_MODE_PROMPT
        })

        console.log("Extraction Result:", JSON.stringify(result, null, 2))
    } catch (error) {
        console.error("Extraction Failed:", error)
    }
}

main()
