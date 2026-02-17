# MindClear V1

> **Your brain wasn't built to hold all this**

An AI-powered cognitive relief web app where users dump mental chaos (text/voice) and receive daily clarity with extracted tasks, commitments, and actionable focus items.

**Status**: ✅ **Production Ready** - Built in 7 days, ready for Product Hunt launch

---

## 🎯 What is MindClear?

MindClear transforms mental overwhelm into calm, focused action through a simple 3-step process:

1. **Dump Everything** - Text or voice, just pour out what's weighing on your mind
2. **AI Processes** - Claude AI extracts tasks, commitments, and deadlines
3. **Get Your 3 Items** - Every morning, see exactly 3 focus items to tackle

**No organizing. No tags. No folders. Just clarity.**

---

## ✨ Key Features

- 🎤 **Voice & Text Capture** - Seamlessly capture thoughts by typing or talking
- 🤖 **Context-Aware AI** - Remembers what you've already captured, no duplicates
- 😌 **Emotional Acknowledgment** - Separates venting from actionable items with empathy
- 📅 **Smart Deadline Detection** - Extracts "tomorrow", "next Friday" into actual dates
- ⏰ **Daily 3-Item Limit** - Forces prioritization, prevents overwhelm
- 🎨 **Glassmorphism UI** - Beautiful, Apple-inspired design aesthetic
- 🔒 **Private by Default** - Your thoughts stay yours, encrypted storage

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier)
- Anthropic API key (Claude)
- Deepgram API key (voice transcription)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mindclear

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
ANTHROPIC_API_KEY=sk-ant-your-key
DEEPGRAM_API_KEY=your-deepgram-key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `DEPLOYMENT.md` for detailed setup instructions.

---

## 📚 Documentation

- **[PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md)** - Complete verification checklist before launch
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Step-by-step Vercel deployment guide
- **[PRODUCT_HUNT.md](PRODUCT_HUNT.md)** - Launch materials, copy, and strategy
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common commands and troubleshooting
- **[ROADMAP.md](ROADMAP.md)** - Post-launch feature roadmap

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Glassmorphism design system

**Backend**
- Next.js API Routes
- Supabase PostgreSQL
- Supabase Auth (email/password)
- Supabase Storage (voice recordings)
- Row Level Security (RLS)

**AI Layer**
- Claude Sonnet 4.5 (Anthropic) - extraction & clarity
- Deepgram Nova-2 - voice transcription

**Deployment**
- Vercel (frontend + API)
- Supabase Cloud (database + auth + storage)

---

## 🏗️ Project Structure

```
mindclear/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, signup, callback
│   │   ├── (dashboard)/         # Capture, clarity, settings
│   │   ├── api/                 # API routes
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── capture/             # Text & voice capture components
│   │   ├── clarity/             # Focus items & actions
│   │   ├── layout/              # App shell, glass cards
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── ai/                  # Claude & Deepgram clients
│   │   │   └── prompts/         # System prompts (IMPORTANT)
│   │   ├── supabase/            # Database clients
│   │   └── db/                  # Queries & types
│   └── types/                   # TypeScript definitions
├── supabase/
│   └── migrations/              # Database schema
└── docs/                        # Documentation
```

---

## 🎨 Design Philosophy

MindClear uses a **glassmorphism** aesthetic inspired by Apple's design language:

- Translucent cards with backdrop blur
- Subtle gradients (blues, teals, greens)
- Smooth animations and micro-interactions
- Generous white space
- Mobile-first responsive design

See `src/app/globals.css` for the design system.

---

## 🧪 Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # Run ESLint
```

### Testing

Test the complete user flow:

1. Sign up with email
2. Capture text dump → verify AI extraction
3. Capture voice dump → verify transcription and extraction
4. Generate daily clarity
5. Test Done/Park/Drop actions

### Database

All database schema is in `supabase/migrations/20240210_initial_schema.sql`.

Key tables:
- `profiles` - User data
- `thought_dumps` - Raw captures
- `items` - Extracted tasks/commitments
- `daily_clarity` - Generated focus items
- `noise_log` - Emotional acknowledgments

---

## 💰 Cost Breakdown

**Development (Week 1)**
- Supabase: $0 (free tier)
- Vercel: $0 (hobby tier)
- Claude API: ~$10-20 (testing)
- Deepgram: $0 ($200 free credit)

**Production (100 active users)**
- Hosting: $0 (free tiers)
- Claude API: ~$60/month
- **Total: ~$60/month**

**Per User**: ~$2.70/month (3 dumps/day)
**Pricing Target**: $9.99/month subscription

Healthy margins for sustainable business.

---

## 🚢 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See `DEPLOYMENT.md` for detailed instructions.

### Post-Deployment

- Update Supabase auth redirect URLs
- Test full flow in production
- Verify voice recording works (HTTPS required)
- Check Lighthouse performance scores

---

## 📈 Roadmap

**V1.0 (Current)**
- ✅ Text & voice capture
- ✅ AI extraction
- ✅ Daily clarity
- ✅ Focus item actions
- ✅ Glassmorphism UI

**V1.1 (Week 2)**
- Weekly reflection emails
- Data export
- Custom focus item count
- Performance optimizations

**V1.2 (Month 1)**
- Browser extension
- Stripe integration
- Team/family plans

**V2.0 (Month 2+)**
- iOS/Android apps
- Advanced AI features
- Commitment tracking
- Habit pattern detection

See `ROADMAP.md` for full details.

---

## 🐛 Known Issues

### Minor
- Supabase type inference requires `@ts-ignore` in some places (known limitation)
- One ESLint warning for useEffect dependency (non-critical)

### V1 Limitations (Intentional)
- Email auth only (OAuth in V2)
- No payments yet (Stripe post-launch)
- No data export (coming in V1.1)
- Requires internet connection (no offline mode)

---

## 🤝 Contributing

This is currently a solo project built for Product Hunt launch. Contributions welcome after V1.0 launch.

---

## 📄 License

[Your License Here]

---

## 🙏 Acknowledgments

Built with:
- Claude AI (Anthropic) for intelligent extraction
- Deepgram for voice transcription
- Supabase for backend infrastructure
- Vercel for hosting
- shadcn/ui for component library

---

## 📞 Support

- Issues: GitHub Issues
- Email: [your-email]
- Twitter: [your-twitter]

---

**Status**: ✅ Ready for Product Hunt Launch

**Demo**: [Coming Soon]

**Built in 7 days** - From idea to launch-ready application.

**"Your brain wasn't built to hold all this. Let MindClear help."** 🧠✨
