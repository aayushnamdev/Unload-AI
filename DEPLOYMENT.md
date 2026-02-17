# MindClear V1 - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project set up
- API keys ready

### Step 1: Push to GitHub

```bash
cd mindclear
git init
git add .
git commit -m "Initial MindClear V1 - Product Hunt ready"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Step 3: Environment Variables in Vercel

Add these in Vercel dashboard under Settings → Environment Variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://josavjgczsfmzjnriuoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
ANTHROPIC_API_KEY=sk-ant-your-actual-key
DEEPGRAM_API_KEY=your-deepgram-key

# App Config
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### Step 4: Configure Supabase for Production

1. **Update Auth Redirect URLs** in Supabase Dashboard → Authentication → URL Configuration:
   - Add: `https://your-vercel-domain.vercel.app/auth/callback`
   - Add: `https://your-vercel-domain.vercel.app`

2. **Verify Database Migration** is applied:
   - Go to SQL Editor
   - Run the migration from `supabase/migrations/20240210_initial_schema.sql`

3. **Create Storage Bucket**:
   - Go to Storage
   - Create bucket named `voice-recordings`
   - Make it public
   - Enable RLS policies

### Step 5: Test in Production

1. Visit your Vercel URL
2. Sign up for a new account
3. Test capture flow
4. Test clarity generation
5. Verify all features work

---

## 🔧 Custom Domain Setup (Optional)

### Buy Domain
- Namecheap, GoDaddy, or any provider
- Recommended: `mindclear.app` or `mindclear.io`

### Configure in Vercel
1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

### Update Environment Variables
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Update Supabase Auth URLs
Add custom domain to Supabase auth redirect URLs.

---

## 📊 Monitoring & Analytics (Post-Launch)

### Recommended Tools
- **Vercel Analytics**: Built-in, enable in dashboard
- **PostHog**: User analytics (optional)
- **Sentry**: Error tracking (optional)

### Key Metrics to Track
- Sign-up conversions
- Daily active users
- Capture → Clarity completion rate
- AI processing success rate
- Average items per clarity

---

## 🔒 Security Checklist

- [ ] All environment variables in Vercel (never in code)
- [ ] Supabase RLS policies enabled on all tables
- [ ] Storage bucket has proper access controls
- [ ] API routes validate user authentication
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Rate limiting considered for API routes (future enhancement)

---

## 💰 Cost Estimates (Post-Launch)

### Free Tier Limits
- **Vercel**: 100GB bandwidth, unlimited requests
- **Supabase**: 500MB database, 50K users, 1GB file storage
- **Anthropic API**: Pay-as-you-go (~$0.02 per dump)
- **Deepgram**: $200 free credit

### Expected Costs (100 active users)
- Vercel: $0 (within free tier)
- Supabase: $0 (within free tier)
- Anthropic: ~$60/month (100 users × 3 dumps/day × $0.02)
- Deepgram: $0 (within free credit for 6-12 months)

**Total: ~$60/month** for 100 active users

### Scaling Plan
- 1,000 users: ~$600/month (still on free hosting)
- 10,000 users: ~$6,000/month + Supabase Pro ($25/mo)
- Consider monetization before reaching 1,000 users

---

## 🐛 Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify TypeScript types compile locally
- Check Vercel build logs

### Auth Not Working
- Verify Supabase redirect URLs include production URL
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Ensure cookies are enabled in browser

### AI Processing Fails
- Verify ANTHROPIC_API_KEY is valid
- Check API key has sufficient credits
- Look at Vercel function logs

### Voice Recording Fails
- Verify DEEPGRAM_API_KEY is valid
- Check storage bucket exists and is accessible
- Test microphone permissions in browser

---

## 📈 Post-Deployment Checklist

- [ ] Production URL works
- [ ] Sign up flow complete end-to-end
- [ ] Capture (text) works
- [ ] Capture (voice) works
- [ ] AI processing completes
- [ ] Clarity generation works
- [ ] Done/Park/Drop actions work
- [ ] Mobile responsive
- [ ] All animations smooth
- [ ] No console errors
- [ ] OG image displays when shared

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main`:

```bash
# Make changes
git add .
git commit -m "Fix: improve clarity generation"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

---

## 📧 Support & Monitoring

### Set Up Alerts
1. Vercel email notifications for deploy failures
2. Supabase alerts for database issues
3. Monitor Anthropic usage dashboard

### User Support
- Monitor user sign-ups
- Watch for error patterns
- Collect feedback via Product Hunt comments

---

## Next Steps After Deployment

1. ✅ Deploy successfully
2. ✅ Test all features in production
3. ✅ Share on Product Hunt
4. ✅ Monitor for bugs in first 24 hours
5. ✅ Iterate based on user feedback
6. Consider adding features from original roadmap (Day 7+)
