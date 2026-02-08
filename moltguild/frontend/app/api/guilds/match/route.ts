import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import IDL from "../../../../target/idl/moltguild.json";
import type { Moltguild } from "../../../../target/types/moltguild";

const PROGRAM_ID = new PublicKey("9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp");

interface MatchRequest {
  agentSkills: string[];
  projectType?: string;
  preferredSize?: "small" | "medium" | "large"; // 2-5, 6-10, 11+
  openOnly?: boolean;
}

interface GuildMatch {
  pubkey: string;
  name: string;
  description: string;
  memberCount: number;
  isOpen: boolean;
  matchScore: number;
  matchReasons: string[];
}

function calculateMatchScore(
  guild: any,
  request: MatchRequest
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Skill matching (check description for keywords)
  const guildDesc = guild.description.toLowerCase();
  const matchingSkills = request.agentSkills.filter((skill) =>
    guildDesc.includes(skill.toLowerCase())
  );
  if (matchingSkills.length > 0) {
    score += matchingSkills.length * 20;
    reasons.push(`Matches ${matchingSkills.length} of your skills: ${matchingSkills.join(", ")}`);
  }

  // Project type matching
  if (request.projectType) {
    const projectKeywords = request.projectType.toLowerCase().split(" ");
    const matchedKeywords = projectKeywords.filter((kw) => guildDesc.includes(kw));
    if (matchedKeywords.length > 0) {
      score += 30;
      reasons.push(`Guild focuses on ${request.projectType}`);
    }
  }

  // Size preference
  if (request.preferredSize) {
    const memberCount = guild.memberCount;
    let sizeMatch = false;
    if (request.preferredSize === "small" && memberCount >= 2 && memberCount <= 5) {
      sizeMatch = true;
    } else if (request.preferredSize === "medium" && memberCount >= 6 && memberCount <= 10) {
      sizeMatch = true;
    } else if (request.preferredSize === "large" && memberCount >= 11) {
      sizeMatch = true;
    }
    if (sizeMatch) {
      score += 15;
      reasons.push(`Size matches your preference (${request.preferredSize})`);
    }
  }

  // Open guilds get bonus
  if (guild.isOpen) {
    score += 10;
    reasons.push("Open for new members");
  }

  // Active guilds (more members = more active)
  if (guild.memberCount >= 3) {
    score += 10;
    reasons.push("Active guild with multiple members");
  }

  return { score, reasons };
}

export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json();
    const { agentSkills, projectType, preferredSize, openOnly } = body;

    if (!agentSkills || agentSkills.length === 0) {
      return NextResponse.json({ error: "agentSkills is required" }, { status: 400 });
    }

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
      "confirmed"
    );

    // Create minimal provider
    const provider = new AnchorProvider(
      connection,
      {} as any,
      { commitment: "confirmed" }
    );
    const program = new Program<Moltguild>(IDL as Moltguild, provider);

    // Fetch all guilds
    const guilds = await program.account.guild.all();

    // Calculate match scores
    const matches: GuildMatch[] = guilds
      .map((g) => {
        const { score, reasons } = calculateMatchScore(g.account, body);
        return {
          pubkey: g.publicKey.toBase58(),
          name: g.account.name,
          description: g.account.description,
          memberCount: g.account.memberCount,
          isOpen: g.account.isOpen,
          matchScore: score,
          matchReasons: reasons,
        };
      })
      .filter((m) => {
        // Filter by openOnly if specified
        if (openOnly && !m.isOpen) return false;
        // Only include guilds with some match score
        return m.matchScore > 0;
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches

    return NextResponse.json({
      matches,
      total: matches.length,
      query: body,
    });
  } catch (error: any) {
    console.error("Guild matching error:", error);
    return NextResponse.json(
      { error: "Failed to match guilds", details: error.message },
      { status: 500 }
    );
  }
}
