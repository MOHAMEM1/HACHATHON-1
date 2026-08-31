# 🚀 AgentCampaign — Agentic Marketing Dashboard

**Build marketing campaigns collaboratively with AI agents using WebMCP.**

AgentCampaign is a next-generation marketing dashboard where humans and AI agents work together to create, manage, and optimize advertising campaigns. Instead of manually filling forms and clicking through menus, marketers describe what they want in natural language — and an AI agent executes structured actions through WebMCP tools, updating the dashboard in real-time.

🔗 **Live Demo**: [agentcampaign.vercel.app](https://agentcampaign.vercel.app)
📹 **Video Demo**: [Watch on YouTube](#)

---

## ✨ Why WebMCP?

Traditional web apps are designed for humans to click buttons and fill forms. **WebMCP changes this** by letting websites expose structured tools that AI agents can invoke directly — creating a new paradigm where humans and agents collaborate on the same interface.

### What was impossible before:
- An AI agent couldn't meaningfully interact with a marketing dashboard — it had no way to "set the audience" or "allocate a budget"
- Marketers had to manually configure every aspect of a campaign across dozens of screens
- There was no standard way for agents to understand what actions a web app supports

### What AgentCampaign enables:
- **Natural language campaign creation**: "Launch a skincare campaign targeting women 25-40 in Morocco with a 5000 MAD budget"
- **Real-time collaboration**: The agent works while the marketer watches the dashboard update live
- **Structured, reliable execution**: WebMCP tools ensure the agent performs actions correctly every time
- **Human oversight**: The marketer reviews and adjusts everything before launching

---

## 🔧 WebMCP Tools (7 Registered Tools)

AgentCampaign registers **7 WebMCP tools** that any AI agent can discover and invoke:

| Tool | Description |
|------|-------------|
| `generate_campaign_brief` | Creates a structured brief from a natural language description |
| `set_target_audience` | Configures demographics, interests, and geographic targeting |
| `generate_ad_copy` | Generates platform-specific ad copy (Instagram, Facebook, Google, TikTok) |
| `allocate_budget` | Distributes budget across platforms with estimated reach and CPC |
| `schedule_campaign` | Sets timeline with phases and posting frequency |
| `preview_campaign` | Returns a complete summary of the campaign configuration |
| `analyze_performance` | Provides KPIs, trend analysis, and optimization recommendations |

### Implementation Example:

```javascript
document.modelContext.registerTool({
  name: "generate_campaign_brief",
  description: "Generate a structured marketing campaign brief from a natural language description.",
  inputSchema: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description: "Natural language description of the campaign"
      },
      industry: {
        type: "string",
        description: "Industry or sector (cosmetics, tech, food, etc.)"
      }
    },
    required: ["description"]
  },
  execute: async (input) => {
    // Generate brief and update the dashboard UI in real-time
    const brief = createBrief(input.description, input.industry);
    updateDashboard(brief);
    return { success: true, brief };
  }
});
```

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Styling | Vanilla CSS (custom design system) |
| Charts | Recharts |
| Icons | Lucide React |
| State | Custom reactive store (useSyncExternalStore) |
| WebMCP | Native `document.modelContext` API |
| Hosting | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/agentcampaign.git
cd agentcampaign

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Testing WebMCP

**Option 1 — ChatGPT's in-app browser:**
Open the deployed URL in ChatGPT's desktop app browser. The 7 WebMCP tools will be automatically discovered.

**Option 2 — Google Chrome 149+:**
1. Navigate to `chrome://flags/#enable-webmcp-testing`
2. Enable the flag and restart Chrome
3. Open the deployed URL
4. The tools will appear in DevTools → Application → WebMCP

**Option 3 — Demo Mode:**
Click the **"Run Demo"** button on the dashboard to simulate all 7 tools firing in sequence. This shows the full experience without needing a WebMCP-enabled browser.

---

## 📁 Project Structure

```
src/
├── main.jsx                       # Entry point
├── App.jsx                        # Main app with demo mode
├── index.css                      # Design system
├── webmcp/
│   ├── registerTools.js           # 7 WebMCP tool registrations
│   └── campaignStore.js           # Reactive state store
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx            # Navigation + WebMCP status
│   │   └── Navbar.jsx             # Top bar with breadcrumbs
│   ├── campaign/
│   │   ├── KPIRow.jsx             # Animated KPI metric cards
│   │   ├── CampaignBrief.jsx      # Campaign brief card
│   │   ├── AudiencePanel.jsx      # Target audience configuration
│   │   ├── BudgetChart.jsx        # Budget allocation with donut chart
│   │   ├── AdCopyPreview.jsx      # Ad copy with phone mockups
│   │   ├── ScheduleTimeline.jsx   # Campaign timeline
│   │   └── PerformanceMetrics.jsx # Analytics with area charts
│   └── agent/
│       └── AgentActivityLog.jsx   # Real-time agent action feed
```

---

## 🎨 Design

- **Dark mode** premium aesthetic inspired by Linear and Vercel
- **Violet → Blue gradient** accent system
- **Glassmorphism** and subtle depth effects
- **Micro-animations** on every interaction
- **Responsive** layout for all screen sizes
- **Inter** typeface from Google Fonts

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

## 🏆 Built for

**The WebMCP Challenge** on Devpost — exploring the future of the agent-native web where humans and AI agents collaborate on shared interfaces.
