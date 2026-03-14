import { anthropic } from '@ai-sdk/anthropic'
import { streamText, stepCountIs } from 'ai'
import { createAITools } from '@/lib/ai/tools'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, sanitizeInput } from '@/lib/security'

export const dynamic = 'force-dynamic'

export const maxDuration = 30

const MAX_MESSAGES = 50
const MAX_MESSAGE_LENGTH = 4000
const MAX_TOTAL_LENGTH = 40000
const MAX_IMAGE_CHARS = 4000
const VALID_ROLES = ['user', 'assistant', 'system']

// Diagnosis-related keywords that warrant Sonnet's deeper reasoning
const COMPLEX_KEYWORDS = /diagnos|failure|won't start|check engine|no crank|overheat|misfire|transmission|differential|dtc|fault code|troubleshoot|root cause/i

function selectModel(messages: Array<{ role: string; content: string | Array<unknown> }>) {
  // First turn or complex reasoning → Sonnet
  if (messages.length <= 1) return anthropic('claude-sonnet-4-20250514')

  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  if (!lastUserMsg) return anthropic('claude-haiku-4-5-20251001')

  const text = typeof lastUserMsg.content === 'string'
    ? lastUserMsg.content
    : (lastUserMsg.content as Array<{ type: string; text?: string }>)
        .filter(p => p.type === 'text')
        .map(p => p.text || '')
        .join(' ')

  // Long messages or diagnosis keywords → Sonnet
  if (text.length > 500 || COMPLEX_KEYWORDS.test(text)) {
    return anthropic('claude-sonnet-4-20250514')
  }

  // Images always need Sonnet (vision)
  if (Array.isArray(lastUserMsg.content) && lastUserMsg.content.some((p: any) => p.type === 'image')) {
    return anthropic('claude-sonnet-4-20250514')
  }

  return anthropic('claude-haiku-4-5-20251001')
}

const systemPrompt = `You are Mule, the AI assistant for ShopMule - and you work as hard as your name suggests. You're not just a chatbot, you're like the most experienced shop manager who's seen it all and is here to help.

## Your Personality
- You're direct and no-nonsense - shop folks are busy, don't waste their time
- You speak like a real person, not a robot. Use contractions, be casual but professional
- You're proactive - if you see something that needs attention, say it
- You have a sense of humor but know when to be serious
- You take pride in keeping the shop running smooth
- You call users "boss" or "chief" occasionally - you're friendly

## How You Communicate
- Keep responses SHORT and actionable. No walls of text
- Use bullet points for lists
- When you find data, present the key info first, details second
- If something's urgent, lead with that
- Don't ask "Is there anything else?" - just help and let them ask if needed
- Use emojis sparingly but effectively: ⚠️ for warnings, ✅ for success, 🔧 for work orders

## What You Can Actually Do
You have tools to:
- Search customers and vehicles (use these liberally - always look up real data)
- Check and manage work orders
- View inventory and find low stock items
- Get dashboard stats and metrics
- Create new work orders
- Update work order status
- Get smart recommendations

## Your Approach
1. ALWAYS use your tools to get real data - never make stuff up
2. When someone asks about something, look it up first
3. If you're creating or changing something, confirm what you did
4. If there's a problem (low stock, overdue invoice, stale work order), mention it
5. Give specific numbers and names, not vague statements

## Examples of Good Responses

User: "What's going on today?"
You: "Let me check... [uses getDashboardStats]
Here's the rundown:
• 3 work orders in progress right now
• 2 pending estimates waiting on customer approval
• ⚠️ 4 parts running low - might want to reorder
• $2,450 in unpaid invoices

Want me to dig into any of these?"

User: "Find John's truck"
You: [uses searchCustomers, searchVehicles]
"Found it! John Martinez has a 2019 Ford F-150 (plate: ABC-123).
Currently has a pending work order for brake inspection created 2 days ago.
Want me to pull up that work order?"

User: "Create a work order for oil change"
You: "Sure thing - which vehicle? Give me a customer name or license plate and I'll set it up."

## What NOT to Do
- Don't give long introductions or sign-offs
- Don't say "I'd be happy to help" - just help
- Don't explain what you're about to do in detail - just do it
- Don't apologize excessively
- Don't ask for confirmation before looking things up (only before making changes)

Remember: You're here to make their job easier. Be the assistant everyone wishes they had.`

function isValidMessage(msg: unknown): msg is { role: string; content: string | Array<unknown> } {
  if (typeof msg !== 'object' || msg === null) return false
  const m = msg as Record<string, unknown>
  if (typeof m.role !== 'string' || !VALID_ROLES.includes(m.role)) return false
  // Accept string content or array content (multipart: text + image)
  return typeof m.content === 'string' || Array.isArray(m.content)
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(JSON.stringify({ error: 'Please sign in to use the AI assistant' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Ensure tenant isolation for AI tools
    const tenantId = session.user.tenantId
    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'No tenant associated with user' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Plan gating — AI requires STARTER+
    const { checkFeatureAccess } = await import('@/lib/plans')
    const planCheck = await checkFeatureAccess(tenantId, 'aiAccess')
    if (!planCheck.allowed) {
      return new Response(JSON.stringify({ error: planCheck.error, requiredPlan: planCheck.requiredPlan }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(session.user.id, 'ai')
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.resetIn),
        }
      })
    }

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Cap message count
    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `Too many messages (max ${MAX_MESSAGES})` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate and sanitize messages
    let totalLength = 0
    const sanitizedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string | Array<unknown> }> = []

    for (const msg of messages) {
      if (!isValidMessage(msg)) {
        return new Response(JSON.stringify({ error: 'Invalid message format: each message must have a valid role (user/assistant/system) and string or array content' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (typeof msg.content === 'string') {
        if (msg.content.length > MAX_MESSAGE_LENGTH) {
          return new Response(JSON.stringify({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          })
        }
        totalLength += msg.content.length
      } else {
        // Multipart content — measure only text parts, budget per-image
        for (const part of msg.content as Array<{ type: string; text?: string }>) {
          if (part.type === 'text' && part.text) {
            totalLength += part.text.length
          } else if (part.type === 'image') {
            totalLength += MAX_IMAGE_CHARS
          }
        }
      }

      if (totalLength > MAX_TOTAL_LENGTH) {
        return new Response(JSON.stringify({ error: `Total message content too long (max ${MAX_TOTAL_LENGTH} characters)` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (typeof msg.content === 'string') {
        sanitizedMessages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: sanitizeInput(msg.content),
        })
      } else {
        // Pass multipart content through — sanitize only text parts
        const sanitizedParts = (msg.content as Array<Record<string, unknown>>).map(part => {
          if (part.type === 'text' && typeof part.text === 'string') {
            return { ...part, text: sanitizeInput(part.text) }
          }
          return part
        })
        sanitizedMessages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: sanitizedParts,
        })
      }
    }

    // Add user context to the system prompt
    const userName = sanitizeInput(session.user?.name || session.user?.email?.split('@')[0] || 'boss')
    const personalizedPrompt = `${systemPrompt}\n\nThe current user is ${userName}. Address them naturally.`

    const result = streamText({
      model: selectModel(sanitizedMessages as Array<{ role: string; content: string | Array<unknown> }>),
      system: personalizedPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: sanitizedMessages as any,
      tools: createAITools(tenantId),
      stopWhen: stepCountIs(5),
      onError: (error) => {
        console.error('[AI Chat Stream Error]', error)
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[AI Chat Error]', error)
    return new Response(JSON.stringify({ error: 'Something went wrong. Try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
