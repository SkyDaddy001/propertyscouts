# Home Realtors Implementation Plan (with AI Chat)

> **Execution Method:** Subagent-Driven Development with inline execution
> **Status:** Ready for parallel task execution

**Goal:** Build Hub & Spokes real estate website with 21 landing pages, automated pricing, and AI Chat assistant on homepage.

**Tech Stack:** Hugo, GitHub Pages, Claude API, n8n, Google Sheets, GitHub Actions

---

## TASK EXECUTION PLAN

### BATCH 1: Foundation (Parallel)

#### Task 1.1: Initialize Hugo Project
- Create Hugo project structure
- Configure config.toml
- Initialize git with all config files
- Commit: "init: Hugo project setup"

#### Task 1.2: Create AI Chat Integration
- Create Claude API integration layer (`/api/chat-endpoint.js`)
- Build chat widget HTML/CSS/JS (`/static/js/chat-widget.js`)
- Add chat UI to homepage
- Configure API keys in environment
- Commit: "feat: add Claude AI chat widget"

#### Task 1.3: Create Price Management System
- Create `data/prices.json` template
- Create `data/properties.json`
- Create price-card partial template
- Commit: "feat: add price data structure"

#### Task 1.4: Set Up GitHub Actions
- Create `.github/workflows/build.yml` (auto-deploy)
- Create `.github/workflows/rebuild-on-webhook.yml` (n8n trigger)
- Commit: "ci: add GitHub Actions workflows"

---

### BATCH 2: Content & Templates (Parallel)

#### Task 2.1: Create Hugo Layouts
- Create `layouts/index.html`
- Create `layouts/_default/single.html`
- Create partials: header, footer, nav
- Commit: "feat: create Hugo layouts and partials"

#### Task 2.2: Create SkyLiving Hub Page
- Create `/content/skylivng/_index.md`
- Build comprehensive hub content
- Include links to all 6 spokes
- Commit: "content: create SkyLiving hub page"

#### Task 2.3: Create SkyLiving Investor Spoke
- Create `/content/skylivng/investors.md`
- Include ROI calculations, yield metrics
- Add investment-focused nurture form
- Commit: "content: create SkyLiving investor landing page"

#### Task 2.4: Create SkyLiving Family Spoke
- Create `/content/skylivng/families.md`
- Focus on schools, healthcare, lifestyle
- Commit: "content: create SkyLiving family landing page"

---

### BATCH 3: Remaining SkyLiving Spokes (Parallel)

#### Task 3.1: Create Luxury Spoke
- Create `/content/skylivng/luxury.md`

#### Task 3.2: Create Location Spoke
- Create `/content/skylivng/location.md`

#### Task 3.3: Create Pricing Spoke
- Create `/content/skylivng/pricing.md`

#### Task 3.4: Create NRI Spoke
- Create `/content/skylivng/nri.md`
- Multi-currency display
- FPI process explanation

---

### BATCH 4: Styling & JavaScript

#### Task 4.1: Create CSS
- Create `static/css/main.css`
- Responsive design for all devices
- Dark mode support

#### Task 4.2: Create Form & Chat JavaScript
- Create `static/js/app.js`
- Form submission handling
- Chat widget event listeners
- Multi-currency price updates

---

### BATCH 5: Clone to LeagueOne & LuxeOne

#### Task 5.1: Clone SkyLiving to LeagueOne
- Copy all 7 pages with property-specific data

#### Task 5.2: Clone SkyLiving to LuxeOne
- Copy all 7 pages with property-specific data

---

### BATCH 6: n8n & Automation Documentation

#### Task 6.1: Create n8n Setup Documentation
- Document Google Sheets API setup
- n8n workflow configuration
- Forex API integration

#### Task 6.2: Create Deployment Guide
- GitHub Pages setup
- Custom domain configuration
- Environment variables

---

### BATCH 7: Testing & Final Review

#### Task 7.1: Test Hugo Build Locally
- Run `hugo server`
- Verify all pages render
- Test responsive design
- Test AI Chat widget

#### Task 7.2: Test Price Updates
- Simulate Google Sheets update
- Verify prices.json generation
- Test n8n trigger

---

## AI CHAT SPECIFICATIONS

### Features
- Live chat widget on homepage
- Claude API backend
- Real estate knowledge base context
- Lead capture integration
- Multi-message conversations

### Widget Placement
- Bottom-right corner of homepage
- Minimizable/expandable
- Mobile-responsive
- Smooth animations

### Conversation Context
- Property information auto-injected
- Buyer persona detection
- Lead information capture
- Conversation history (session)
- Handoff to sales team on request

### Technical Implementation
- Frontend: HTML5 chat bubble + CSS animations
- Backend: Next.js API route or Netlify Functions
- LLM: Claude API (claude-opus-4-6 for intelligence)
- Database: Airtable for conversation logs
- Auth: API key protection

---

## IMPLEMENTATION SEQUENCE

1. **Start BATCH 1** (parallel: Hugo + AI Chat + Pricing + GitHub Actions)
2. **After BATCH 1:** Start BATCH 2-3 (content pages, parallel)
3. **After BATCH 2-3:** Start BATCH 4 (styling)
4. **After BATCH 4:** Start BATCH 5 (clone to other properties)
5. **After BATCH 5:** Start BATCH 6 (documentation)
6. **After BATCH 6:** Start BATCH 7 (testing)
7. **After BATCH 7:** Deploy to GitHub Pages

---

## QUALITY GATES

- ✅ Spec compliance review after each task
- ✅ Code quality review after each task
- ✅ Hugo build passes locally
- ✅ All 21 pages render without errors
- ✅ AI Chat widget works on all devices
- ✅ Forms submit successfully
- ✅ Responsive design tested on mobile/tablet/desktop
- ✅ Git history clean with meaningful commits
