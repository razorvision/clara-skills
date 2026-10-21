---
name: domain-picker
description: Brainstorms and evaluates domain names for a product or project through interactive discovery, competitive research, scored name generation, and authoritative .com availability checks against the Verisign RDAP registry, then delivers a ranked shortlist with rationale as a markdown file. Use when the user says "pick a domain", "domain name", "name this product", or wants to brainstorm brand names for a web product.
license: Apache-2.0
compatibility: Requires outbound network access to query the Verisign RDAP API (via curl or PowerShell) and a web search tool for competitive research.
metadata:
  version: "0.1.1" # x-release-please-version
  owner: razorvision
---

# Domain Name Picker Skill

Generate and evaluate domain name candidates through **interactive discovery, competitive research, and availability checking**. Produces a ranked shortlist with rationale.

## When This Skill Activates

- User invokes `/domain-picker` explicitly
- User says "pick a domain", "domain name", "name this product/project"
- User wants to brainstorm brand names for a web product

---

## Phase 1: Product Discovery

Before generating any names, deeply understand what's being named. If in an existing project, explore the codebase. Otherwise, ask questions.

### Codebase Exploration (if applicable)

Spawn an exploration subagent to understand:
- Landing page copy, taglines, value proposition
- Core features and what makes the product unique
- Target audience and use cases
- Existing branding elements (colors, typography, tone)
- Competitive positioning (who are the alternatives?)

### Discovery Questions

Ask the user (with a structured question tool if your host has one) to gather preferences. Combine into 2-3 rounds maximum.

**Round 1: Product & Audience**
- What does this product do in one sentence?
- Who is the target audience?
- What feeling should the brand evoke? (options: professional/trustworthy, fun/playful, technical/cutting-edge, premium/luxury)
- Are there industry/niche terms that resonate with your audience?

**Round 2: Naming Preferences**
- Naming pattern preference? (options: invented word like Canva/Figma, word combo like Dropbox/Mailchimp, descriptive like Booking.com/Hotels.com, acronym like IBM/AWS)
- How important is .com? (options: required, preferred, either .com or relevant alternative)
- Should the name be niche-specific or broadly brandable?
- Budget for domain purchase? (options: standard registration under $50, aftermarket $50-500, premium $500-2000, investment $2000+)

**Round 3 (if needed): Refinement**
- Any words or themes to include or avoid?
- Expanding to other markets later or staying focused?

### Discovery Rules

1. Don't generate names until you understand the product and preferences
2. Adapt questions based on context; skip what's already known
3. Maximum 3 rounds of questions before proceeding

---

## Phase 2: Competitive Research

Research the naming landscape in the product's niche.

### What to Research

1. **Competitor domains**: What domains do the top 5-10 competitors use?
2. **Naming patterns**: What works in this niche? (compound words, invented names, acronyms)
3. **TLD trends**: What TLDs are common? (.com, .io, .gg, .app, .tools)
4. **Character length**: What's the sweet spot in this niche?

### How to Research

Spawn an exploration subagent with web search to:
- Search for "[niche] tools websites domains"
- Search for "best domain name practices [year]"
- Catalog competitor domains into a table: name, TLD, character count, pattern

### Output

Create a competitive landscape table:

| Competitor | Domain | Chars | Pattern |
|-----------|--------|-------|---------|
| ... | ... | ... | ... |

Identify the dominant pattern (length, TLD, naming style).

---

## Phase 3: Name Generation

Generate 15-25 candidate names using multiple strategies.

### Generation Strategies

1. **Niche term + common word** (highest success in most niches)
   - Identify 5-8 strong niche/industry terms
   - Combine each with: field, forge, craft, lab, hub, base, keep, path, fall, well, helm, deck, vault, den, core, mark, stack, wise, sight, lens, gate, peak, cove, nest, port
   - Target 6-10 characters

2. **Invented/portmanteau words**
   - Blend two relevant words into one new word
   - Ensure it's pronounceable and spellable
   - Examples: Spotify (spot + identify), Pinterest (pin + interest)

3. **Creative spelling**
   - Take a relevant word and modify spelling
   - Examples: Lyft, Tumblr, Flickr, Fiverr

4. **Metaphor names**
   - Use a concept that represents what the product does
   - Examples: Slack (ease), Notion (idea), Figma (figure)

### Evaluation Criteria

Score each candidate on:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Memorability | 25% | Can someone recall it after hearing once? |
| Spellability | 20% | Phone test: can you say it and they type it correctly? |
| Brandability | 20% | Unique enough to trademark? Won't be confused with others? |
| Niche fit | 15% | Does it resonate with the target audience? |
| Length | 10% | 6-10 chars ideal, 11-12 acceptable, 13+ too long |
| Marketability | 10% | Does it sound professional enough for the business model? |

### Filtering

Cut the list to 10-12 candidates by eliminating:
- Names longer than 12 characters
- Names that fail the phone test
- Names too similar to existing competitors
- Names with unintended meanings or associations
- Names that sound generic or untrademarkable

---

## Phase 4: Availability Check (Verisign RDAP)

Check domain availability using the **Verisign RDAP registry**, the authoritative source for .com domains. This is fast, definitive, and does not require guessing from web searches.

### RDAP Lookup Method

A HEAD request to the Verisign RDAP endpoint tells you the registration state:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -I "https://rdap.verisign.com/com/v1/domain/EXAMPLE.com"
# HTTP 200 = taken, HTTP 404 = available
```

### Batch Check (recommended)

Check all candidates in one shell call. Candidate names come from the model and from web research, so validate each one against `^[a-z0-9-]+$` (lowercase letters, digits, hyphens) **before** writing it into the command, and drop any that fail. The shell expands the list before the loop runs, so the check inside the loop below is only a backstop, not the defense.

Bash (macOS, Linux, WSL, Git Bash):

```bash
for d in name1 name2 name3; do
  [[ "$d" =~ ^[a-z0-9-]+$ ]] || { echo "$d: SKIPPED (invalid name)"; continue; }
  code=$(curl -s -o /dev/null -w "%{http_code}" -I "https://rdap.verisign.com/com/v1/domain/$d.com")
  case "$code" in
    200) echo "$d.com: TAKEN" ;;
    404) echo "$d.com: AVAILABLE" ;;
    *)   echo "$d.com: ERROR ($code)" ;;
  esac
done
```

PowerShell (Windows):

```powershell
$domains = @('name1','name2','name3')
foreach ($d in $domains) {
  if ($d -cnotmatch '^[a-z0-9-]+$') { Write-Output "${d}: SKIPPED (invalid name)"; continue }
  try {
    Invoke-WebRequest -Uri "https://rdap.verisign.com/com/v1/domain/$d.com" -Method Head -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Output "$d.com: TAKEN"
  } catch {
    if ($_.Exception.Response.StatusCode -eq 'NotFound') { Write-Output "$d.com: AVAILABLE" }
    else { Write-Output "$d.com: ERROR ($($_.Exception.Message))" }
  }
}
```

### Important Notes

- **Only works for .com domains**: Verisign is the .com/.net registry
- For other TLDs (.gg, .io, .app), fall back to web search or note "check manually"
- Results are **definitive**; no "likely" or "possibly" classifications needed
- Can check 50-100 domains in under 30 seconds
- No rate limiting issues at normal volumes

### Workflow

1. Generate all candidate names from Phase 3
2. Run a single batch RDAP check against all .com candidates
3. Immediately eliminate all taken domains
4. Present only confirmed-available domains to user
5. For the top picks, also note that user should verify alternative TLDs manually

### Classify Each Domain

- **Available**: RDAP returned 404 (confirmed not registered)
- **Taken**: RDAP returned 200 (confirmed registered)
- **Error**: Could not reach RDAP (retry or check manually)

### Social Handle Check (mention, don't deeply verify)

Note that the user should also check:
- Twitter/X: @name
- Reddit: r/name
- Discord server name
- GitHub: github.com/name

---

## Phase 5: Final Ranking & Deliverable

### Rank the Top 5

Present 5 finalists ranked by overall score, with:

For each candidate:
- **Domain**: name.tld
- **Characters**: count
- **Pattern**: what naming pattern it follows
- **Meaning**: what the name evokes/means
- **Tagline**: a natural tagline using the name
- **Availability**: available (RDAP-confirmed for .com) / needs manual verification (other TLDs)
- **Strengths**: 2-3 bullet points
- **Risks**: any concerns

### Include Recommendation

Clearly state your top pick and why, comparing it against the runner-up.

### Write Output File

Save the complete analysis to a markdown file:
- **Location**: project root or docs directory
- **Filename**: `domain-brainstorm_{YYYY-MM-DD}.md`

### File Structure

```markdown
# Domain Name Brainstorm: {Product/Project Name}

**Date:** {YYYY-MM-DD}
**Product:** {One-sentence description}

---

## Preferences

- **Pattern**: {naming pattern preference}
- **TLD**: {TLD requirement}
- **Budget**: {budget range}
- **Audience**: {target audience}
- **Brand feel**: {desired brand feeling}

---

## Competitive Landscape

| Competitor | Domain | Chars | Pattern |
|-----------|--------|-------|---------|

**Dominant pattern**: {summary of what works in this niche}

---

## Top 5 Recommendations

### 1. {name}.{tld} (Recommended)

- **Characters**: {N}
- **Pattern**: {pattern}
- **Meaning**: {what it evokes}
- **Tagline**: *"{tagline}"*
- **Availability**: {status}
- **Why this is the top pick**: {rationale}

### 2-5. {Repeat format}

---

## Honorable Mentions

| Domain | Chars | Notes |
|--------|-------|-------|

---

## Availability Verification Method

Domains were verified using **Verisign RDAP** (the authoritative .com registry):
- `HEAD https://rdap.verisign.com/com/v1/domain/EXAMPLE.com`
- HTTP 404 = available, HTTP 200 = taken
- Non-.com TLDs were not verified; check manually at your registrar

## Next Steps

1. Register .com at your preferred registrar
2. Check and register alternative TLD (.gg, .io) at registrar
3. Check social handle availability (@name on Twitter, Reddit, Discord)
4. Run a trademark search in the relevant jurisdiction (for the US, the USPTO trademark search)
5. Test with 2-3 people in your target audience

---

## Domain Registration Tips

- Compare registrars on renewal price, not just first-year price
- Enable WHOIS privacy protection
- Consider registering both .com and backup TLD
- Set up domain forwarding from backup to primary
```

---

## TLD Guide

Prices are indicative and change; confirm at the registrar.

| TLD | Best For | Annual Cost | Notes |
|-----|----------|-------------|-------|
| **.com** | Universal, any business | ~$10-15 | Gold standard, highest trust |
| **.io** | Tech startups, dev tools | ~$30-50 | Popular with SaaS, developers |
| **.dev** | Developer-focused products | ~$12-15 | Requires HTTPS, signals dev audience |
| **.ai** | AI/ML products | ~$50-80 | Premium but highly relevant for AI tools |
| **.gg** | Gaming tools, communities | ~$15-20 | "Good game", recognized in gaming culture |
| **.app** | Mobile or web applications | ~$15-20 | Requires HTTPS, clean look |
| **.co** | Alternative to .com | ~$25-30 | Shorter than .com alternatives |
| **.xyz** | Modern, creative projects | ~$10-12 | Budget-friendly, less established trust |
| **.design** | Creative/design agencies | ~$30-40 | Niche but descriptive |
| **.tech** | Technology companies | ~$40-50 | Broad tech signal |

### Pricing Context

When evaluating domains, note the cost tier:
- **Standard registration**: ~$10-15/year (.com, .dev, .xyz)
- **Premium TLDs**: ~$30-80/year (.io, .ai, .tech)
- **Aftermarket (parked/listed)**: $50-$5,000+ depending on demand
- **Premium domains**: $500-$50,000+ for short, high-demand names

---

## Example Workflows

### Startup / SaaS Product
1. Describe the product and target market
2. Get 15-25 domain suggestions across relevant TLDs
3. Review availability and pricing tiers
4. Pick top 3 favorites
5. Register .com + backup TLD immediately

### Personal Brand / Portfolio
1. Share name and profession
2. Get variations (firstname.com, firstnamelastname.dev, etc.)
3. Check social media handle availability
4. Register consistent brand across platforms

### Niche Tool / Community Project
1. Identify niche terminology and audience expectations
2. Research competitor naming patterns
3. Generate niche-specific combinations
4. Verify availability in preferred TLD
5. Test name with target community before committing

---

## Guidelines

### Do
- Research thoroughly before generating names
- Prioritize .com unless user explicitly prefers otherwise
- Consider the full brand picture (domain + social handles + trademark)
- Check for unintended meanings or associations in other languages
- Tailor suggestions to the business model (B2C vs B2B, free vs paid)
- Give a clear top recommendation with reasoning
- **Register variations**: grab .com + backup TLD to protect the brand
- **Act fast**: good domains get taken quickly, register same day if possible

### Don't
- Generate names without understanding the product first
- Suggest names longer than 12 characters
- Recommend names too similar to established competitors
- Present domains without RDAP verification; always batch-check .com availability before presenting to user
- Overthink it; sometimes the first good name IS the best name
- Skip the competitive landscape; context matters for naming
- Use hyphens or numbers; they are hard to communicate verbally
