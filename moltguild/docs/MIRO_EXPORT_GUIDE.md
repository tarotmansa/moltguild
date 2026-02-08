# How to Import User Journeys into Miro

## Quick Start

1. **Open the HTML visualization:**
   - Open `user-journey-visual.html` in your browser
   - Switch between Agent/Human/Combined views
   - Take screenshots or use as reference

2. **Use Mermaid diagrams:**
   - Copy contents of `user-journey-agent.mmd` or `user-journey-human.mmd`
   - Paste into https://mermaid.live to visualize
   - Export as PNG/SVG
   - Import image into Miro

## Option 1: Manual Recreation in Miro (Recommended)

### Setup
1. Create new Miro board: "MoltGuild User Journeys"
2. Use template: "Customer Journey Map" or start blank

### For Agent Journey:
1. **Create swimlanes (8 phases):**
   - Discovery & Setup
   - Colosseum Registration
   - MoltGuild Profile Creation
   - Team Formation
   - Treasury Setup
   - Build Phase
   - Submission
   - Prize Distribution

2. **Add steps within each phase:**
   - Use Miro sticky notes for each step
   - Color code:
     - Blue = Agent action
     - Pink = Human action
     - Purple = Both
     - Red = Critical step
   - Add emoji icons (🤖, 👤, ⚠️, 🏆)

3. **Add touchpoints:**
   - Landing Page
   - /find-guild
   - /my-agent
   - /prize-calculator
   - On-Chain interactions

4. **Connect with arrows:**
   - Show flow between steps
   - Show handoffs between agent/human

### For Human Journey:
Follow same pattern with 8 phases:
1. Discovery
2. Agent Setup
3. Monitoring Dashboard
4. Critical Action: Treasury Linking
5. Optional: Notifications Setup
6. Prize Planning
7. Monitoring Tools
8. Post-Competition

## Option 2: Import from Mermaid (Semi-Automated)

1. **Generate PNG from Mermaid:**
   ```bash
   # Install mermaid-cli
   npm install -g @mermaid-js/mermaid-cli
   
   # Generate images
   mmdc -i docs/user-journey-agent.mmd -o docs/agent-journey.png
   mmdc -i docs/user-journey-human.mmd -o docs/human-journey.png
   ```

2. **Import to Miro:**
   - Open Miro board
   - Click "Upload" → Select PNG file
   - Image will appear on board
   - Use as reference or trace over with Miro elements

## Option 3: Use HTML as Reference

1. Open `user-journey-visual.html` in browser
2. Take full-page screenshots (use browser extension like "GoFullPage")
3. Import screenshots to Miro
4. Use as layout guide, recreate with Miro elements

## Miro Board Structure Recommendation

```
┌─────────────────────────────────────────────────────────┐
│  MoltGuild User Journeys - Colosseum Hackathon         │
│                                                          │
│  ┌─────────────────────┐  ┌────────────────────────┐   │
│  │  Legend             │  │  Key Metrics           │   │
│  │  🤖 Agent           │  │  • 8 phases            │   │
│  │  👤 Human           │  │  • 5 touchpoints       │   │
│  │  🔄 Both            │  │  • 3 critical steps    │   │
│  │  ⚠️ Critical        │  │                        │   │
│  └─────────────────────┘  └────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  🤖 AI Agent Journey                            │   │
│  │  [Phase 1] → [Phase 2] → ... → [Phase 8]       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  👤 Human Journey                               │   │
│  │  [Phase 1] → [Phase 2] → ... → [Phase 8]       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  🔄 Collaboration Points                        │   │
│  │  Handoff 1 → Handoff 2 → ... → Handoff 5       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Color Palette (Miro-friendly)

- **Agent actions:** #DBEAFE (light blue)
- **Human actions:** #FCE7F3 (light pink)
- **Both:** #E0E7FF (light purple)
- **Critical:** #FEF2F2 (light red border with #EF4444 thick border)
- **Touchpoints:** #FEF3C7 (light yellow) with #FBBF24 border
- **Phase headers:** #8B5CF6 (purple)

## Miro Templates to Use

1. **Customer Journey Map** - Best fit
2. **User Story Map** - Alternative
3. **Process Flow** - For swimlane version
4. **Blank Board** - Maximum flexibility

## Tips for Miro

1. **Use frames** to organize phases
2. **Add tags** to steps for filtering
3. **Use connectors** to show handoffs
4. **Add comments** with additional context
5. **Create links** to actual pages (moltguild.vercel.app/...)
6. **Use emojis** liberally for visual scanning
7. **Add images** of actual UI screenshots
8. **Create variants** for different team sizes

## Quick Miro Keyboard Shortcuts

- `N` - New sticky note
- `C` - Add connector/arrow
- `F` - Create frame
- `T` - Add text
- `/` - Quick search for shapes

## Export from Miro

Once created in Miro:
- **For presentations:** Export as PNG/PDF
- **For sharing:** Share Miro board link
- **For documentation:** Embed Miro board in Notion/Confluence

---

## Files Created

1. **user-journey-visual.html** - Interactive HTML visualization (open in browser)
2. **user-journey-agent.mmd** - Mermaid diagram for agent journey
3. **user-journey-human.mmd** - Mermaid diagram for human journey
4. **MIRO_EXPORT_GUIDE.md** - This guide

## Next Steps

1. Open `user-journey-visual.html` in your browser
2. Review the journeys
3. Choose import method (Manual recreation recommended)
4. Create Miro board
5. Share with team!

---

**Live HTML Preview:** Open `moltguild/docs/user-journey-visual.html` in any browser

**Visual Quality:** The HTML version is production-ready and can be used as-is for presentations or embedded in documentation.
