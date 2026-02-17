# MindClear - Quick Reference Guide

Quick answers to common questions and operations.

---

## 🚀 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Run linter
npm run lint

# Install dependencies
npm install

# Add new shadcn component
npx shadcn-ui@latest add [component-name]
```

---

## 🔑 Environment Variables

Required variables in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# AI APIs
ANTHROPIC_API_KEY=sk-ant-api03-...
DEEPGRAM_API_KEY=...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Database Quick Access

### Supabase Dashboard
https://supabase.com/dashboard/project/YOUR_PROJECT_ID

### Key Tables
- `profiles` - User profiles
- `thought_dumps` - Raw captures
- `items` - Extracted tasks/commitments
- `daily_clarity` - Generated focus items
- `noise_log` - Emotional acknowledgments

### Useful SQL Queries

```sql
-- Check recent thought dumps
SELECT id, created_at, substring(content, 1, 100) as preview
FROM thought_dumps
ORDER BY created_at DESC
LIMIT 10;

-- Check extracted items for a user
SELECT type, text, status, created_at
FROM items
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;

-- Check daily clarity
SELECT created_at, morning_message, focus_items
FROM daily_clarity
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;

-- Count items by status
SELECT status, COUNT(*)
FROM items
WHERE user_id = 'USER_ID_HERE'
GROUP BY status;

-- Reset a user's data (for testing)
DELETE FROM thought_dumps WHERE user_id = 'USER_ID_HERE';
DELETE FROM items WHERE user_id = 'USER_ID_HERE';
DELETE FROM daily_clarity WHERE user_id = 'USER_ID_HERE';
DELETE FROM noise_log WHERE user_id = 'USER_ID_HERE';
```

---

## 🐛 Troubleshooting

### Build Fails

**Error**: TypeScript compilation errors
```bash
# Check specific errors
npm run build

# Common fix: TypeScript version issue
npm install typescript@latest
```

**Error**: Missing dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Authentication Issues

**Problem**: Can't log in after signup
- Check Supabase email confirmation setting
- Verify auth redirect URLs in Supabase dashboard
- Check browser console for errors

**Problem**: Infinite redirect loop
- Check middleware.ts logic
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Clear browser cookies and try again

### AI Processing Fails

**Error**: "Invalid API key"
```bash
# Verify in .env.local
echo $ANTHROPIC_API_KEY  # Should start with sk-ant-
```

**Error**: "Rate limit exceeded"
- Wait 60 seconds and try again
- Check Anthropic console for usage limits
- Consider using Claude Haiku for testing

**Error**: "Could not parse AI response"
- Check API route logs in browser console
- Verify extraction prompt hasn't been modified
- Test with simpler input first

### Voice Recording Issues

**Problem**: Microphone permission denied
- Grant permission in browser settings
- HTTPS required for production (Vercel provides this)
- Check browser console for MediaRecorder errors

**Problem**: Transcription fails
```bash
# Verify Deepgram API key
echo $DEEPGRAM_API_KEY
```

**Problem**: Audio file too large
- Current limit: 5 minutes max
- Check VoiceCapture.tsx MAX_RECORDING_DURATION
- Increase if needed (will increase costs)

### Supabase Issues

**Problem**: RLS policy blocks legitimate access
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'items';

-- Temporarily disable RLS for testing (NOT in production)
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
```

**Problem**: Storage bucket not accessible
- Verify bucket name matches code (`voice-recordings`)
- Check bucket is public
- Verify RLS policies on bucket

---

## 📊 Monitoring

### Check API Usage

**Anthropic (Claude)**
- Dashboard: https://console.anthropic.com
- Check credits remaining
- View API usage over time

**Deepgram**
- Dashboard: https://console.deepgram.com
- Check free credit balance ($200 initial)
- Monitor transcription minutes used

**Supabase**
- Dashboard → Settings → Usage
- Database size (500MB free tier limit)
- Storage size (1GB free tier limit)
- Auth users (50K free tier limit)

### Performance Checks

```bash
# Lighthouse audit (in Chrome DevTools)
# Target scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >90
# - SEO: >90

# Check bundle size
npm run build
# Look for "First Load JS" - should be < 200KB per route
```

---

## 🔧 Common Modifications

### Change AI Model

In `src/lib/ai/claude.ts`:
```typescript
// Change from Sonnet to Haiku (faster, cheaper)
const response = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022',  // Instead of sonnet
  // ...
})
```

### Adjust Focus Item Limit

In `src/lib/ai/prompts/clarity.ts`:
```typescript
// Change from 3 to 5 items
export const CLARITY_GENERATION_PROMPT = `
...select the top 5 most important items...  // Changed from 3
`
```

### Modify Character Limits

In `src/components/capture/TextCapture.tsx`:
```typescript
const MAX_CHARS = 20000  // Change from 10000
```

### Change Recording Duration

In `src/components/capture/VoiceCapture.tsx`:
```typescript
const MAX_RECORDING_DURATION = 10 * 60 * 1000  // 10 minutes instead of 5
```

---

## 🎨 Design Customization

### Color Palette

In `src/app/globals.css`:
```css
:root {
  --primary: 220 90% 60%;        /* Blue */
  --secondary: 160 80% 50%;      /* Green */
  --accent: 190 85% 55%;         /* Teal */

  /* Change to purple theme */
  --primary: 270 90% 60%;
  --secondary: 290 80% 50%;
  --accent: 250 85% 55%;
}
```

### Glassmorphism Intensity

```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);  /* More opaque */
  backdrop-filter: blur(20px);             /* More blur */
}
```

---

## 📱 Mobile Testing

### Test on Real Devices

**iOS Safari**
- Voice recording requires HTTPS (works in production)
- Test microphone permissions
- Test hold-to-record gesture

**Android Chrome**
- Should work identically to desktop
- Test voice recording
- Check glassmorphism rendering

### Browser DevTools Mobile Simulation

```
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M)
3. Select device: iPhone 14 Pro
4. Test all features
```

---

## 🚀 Deployment Quick Reference

### Vercel Deployment

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables in Vercel

```
Settings → Environment Variables → Add New

Add each variable:
- Name: ANTHROPIC_API_KEY
- Value: sk-ant-...
- Environment: Production, Preview, Development
```

### Custom Domain

```
1. Vercel Dashboard → Settings → Domains
2. Add domain: mindclear.app
3. Add DNS records from Vercel to your domain provider
4. Wait for DNS propagation (5-60 minutes)
5. Update NEXT_PUBLIC_APP_URL in Vercel env vars
6. Update Supabase auth redirect URLs
```

---

## 🧪 Testing Checklist

### Manual Testing Flow

1. **Sign Up**
   - [ ] Email validation works
   - [ ] Redirects to /capture after signup
   - [ ] Profile created in database

2. **Text Capture**
   - [ ] Textarea auto-resizes
   - [ ] Character counter appears
   - [ ] Submit shows processing loader
   - [ ] AI extraction completes
   - [ ] Items appear in database

3. **Voice Capture**
   - [ ] Microphone permission requested
   - [ ] Hold-to-record works
   - [ ] Timer displays during recording
   - [ ] Transcription appears after release
   - [ ] Can edit transcription
   - [ ] Submit works same as text

4. **Clarity Generation**
   - [ ] Click "Generate Clarity" button
   - [ ] Shows 3 focus items
   - [ ] Morning message is warm
   - [ ] Items have type badges
   - [ ] Suggested next steps appear

5. **Item Actions**
   - [ ] Done: Item disappears
   - [ ] Park: Date picker appears, item moves to parked
   - [ ] Drop: Confirmation shows, item disappears

---

## 💡 Pro Tips

### Development

1. **Use Haiku for testing** - 10x cheaper than Sonnet
2. **Cache API responses** - Save money during dev
3. **Test with short dumps** - Faster iteration
4. **Keep console open** - Catch errors early

### Production

1. **Monitor API costs daily** - Set up alerts
2. **Watch for rate limits** - Especially first week
3. **Collect user feedback** - In-app or Product Hunt comments
4. **Iterate quickly** - Fix bugs within hours, not days

### Product Hunt

1. **Launch at 12:01 AM PST** - Maximum visibility
2. **Respond to every comment** - Shows you care
3. **Have video under 60 seconds** - Attention spans are short
4. **Share progress updates** - Keep momentum going

---

## 🔗 Useful Links

### Development
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [shadcn/ui Components](https://ui.shadcn.com)

### Deployment
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)

### Monitoring
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Anthropic Console](https://console.anthropic.com)
- [Deepgram Console](https://console.deepgram.com)

---

## 📞 Getting Help

### Error Messages

Always check:
1. Browser console (F12 → Console)
2. Network tab (F12 → Network) for failed API calls
3. Vercel function logs (Dashboard → Deployments → Function Logs)
4. Supabase logs (Dashboard → Logs)

### Common Error Patterns

```
"Failed to fetch" → CORS or API route issue
"Invalid API key" → Environment variable not set
"Type error" → TypeScript issue (use @ts-ignore if needed)
"Unauthorized" → Auth middleware or Supabase RLS issue
```

---

**Last Updated**: Day 7 - Ready for Launch

**Quick Start**: `npm run dev` → http://localhost:3000 → Sign up → Capture → Clarity

**Deploy**: `git push origin main` → Vercel auto-deploys

**Monitor**: Check Anthropic + Deepgram consoles for usage

**Launch**: Product Hunt at 12:01 AM PST with demo video + screenshots
