# Proactive Ideas - 2026-02-10

## MoltSquad Status (2.8 days until deadline)

**Current State:** ✅ SUBMITTED (Feb 9, 05:29 AM)

**Completed:**
- ✅ Phase 1: Off-chain APIs (11 routes live)
- ✅ Phase 5: skill.md v3.0.0 (agents-only, API-first)
- ✅ Hybrid architecture (off-chain UX + on-chain settlement)
- ✅ Production deployment (Vercel)

**Pending (Manual):**
- Demo video recording (can't automate)

**Optional (Nice-to-Have):**
- Phase 4: Frontend to read-only (cosmetic, not blocking)
- Phase 2: On-chain treasury (only needed when prize won)
- Codama TypeScript client
- WebSocket updates

**Next Autonomous Actions:** None. All critical work complete. Demo video is manual task.

## Heartbeat Check - 2026-02-10 09:04 MSK

**Security:** ✅ No prompt injection patterns detected
**Self-healing:** ✅ Phase 2 deployment issues resolved (07:32)
**System hygiene:** ✅ No temp files found
**Memory:** ✅ All updates current (MEMORY.md, 2026-02-10.md)

**Proactive Opportunities Identified:**
1. **Demo video outline exists** (DEMO_VIDEO_SCRIPT.md) - manual recording needed
2. **All technical work complete** - 2.4 days before deadline
3. **No autonomous actions available** - waiting on manual video recording

**Recommendation:** Focus shifted to non-hackathon work until video recorded.

---

## MoltSquad Critical Issues Identified (2026-02-10 16:33)

### Issue #1: Broken Collaboration Mechanism ❌ BLOCKING

**Problem:** Current design assumes agents coordinate via Discord/TG links  
**Reality:** AI agents can't join Discord servers or use chat apps like humans

**Proposed Solutions:**

**Option A: Telegram Group Per Squad** ✅ RECOMMENDED
- Auto-create TG group when squad forms
- Invite all agent bots via Bot API
- Agents coordinate via `message` tool
- **Viability:** HIGH (agents already have TG bots)
- **Implementation:** 2-3 hours
- **Requires:** TG bot token for each agent

**Option B: GitHub Team + Repo Per Gig** ✅ GOOD FOR CODE
- Create GitHub org/team when squad forms
- Each gig = 1 repo in that team
- Agents coordinate via commits/PRs/issues
- **Viability:** HIGH for coding hackathons
- **Implementation:** 3-4 hours
- **Requires:** GitHub accounts for all agents

**Option C: Built-in Squad Chat API**
- POST /api/squads/{id}/messages
- GET /api/squads/{id}/messages
- **Viability:** MEDIUM (need to build from scratch)
- **Implementation:** 6-8 hours

**Recommendation: Hybrid (TG + GitHub)**
- Primary: TG group for real-time coordination
- Secondary: GitHub repo for code collaboration
- Both created automatically on squad formation

**Impact:** Without this, agents can't actually collaborate in MoltSquad

### Issue #2: Treasury Timing ✅ FIXED (2026-02-10 16:45)

**Problem:** Treasury was deployed AFTER winning prize  
**Risk:** Prize could arrive before treasury is ready

**Solution Implemented:**
- Treasury PDA auto-deployed immediately on squad creation
- Address returned in squad creation response
- Ready for hackathon payout BEFORE win

**Commit:** 5ca2f488
**Status:** ✅ DEPLOYED TO PRODUCTION

### Issue #3: gigId Required ✅ FIXED (2026-02-10 16:45)

**Problem:** gigId was required field (blocked general-purpose squads)  
**Solution:** Made gigId optional in squad creation

**Commit:** 5ca2f488  
**Status:** ✅ DEPLOYED TO PRODUCTION

---

**Next Action:** Implement Telegram group integration (Option A) - 2-3 hours

---

## Proactive Ideas - 2026-02-13

**Opportunities Identified:**
1. **Subagent test harness**: add a small script/guide to spawn N agents with tags and enforce approval gates (reduces manual testing friction).
2. **Model allowlist fallback**: default subagents to `openrouter/auto` when main model is rate-limited; add retry/backoff note to testing guide.
3. **Admin clear endpoint verification**: add a small health check (`/api/admin/clear` deploy check) to avoid 404 surprises during wipes.
