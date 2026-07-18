# ProfitPilot — Your AI Business Partner That Finds Money You're Losing

**Subtitle:** A Gemma 4-orchestrated advisory agent that detects hidden profit leaks in SME data, explains them with evidence, and generates ready-to-send actions — built in one day.

**Track:** Gemma SME Growth & Advisory Agent (Track 3)

---

<!-- TARGET: ≤1,500 words total. Current template body ≈ 1,100 words when filled. -->
<!-- RUBRIC MAP: §2 & §4 → Gemma Integration (30%) | §1 & §7 → Innovation & Impact (30%) | §3 & §5 → Functionality (20%) | The whole doc's clarity → Presentation (20%) -->

## 1. The Problem (≈150 words)

Most SME owners know exactly how much they sell — and have no idea where they silently lose money.

India has 63M+ MSMEs, and the vast majority run on spreadsheets or basic billing apps. Existing AI finance tools (Trullion, MindBridge, Numeric, DataSnipper) are built for accountants and audit teams at enterprises — they reconcile books and flag anomalies, but none of them *advise*. They assume a finance team exists. For a shop owner, there is no tool that answers: "Why did my profit drop in June, and what single thing should I do about it this week?"

<!-- FILL: one concrete persona sentence, e.g. "A Bengaluru retailer doing ₹12L/month revenue but only 2% profit growth" — make it feel like a real person -->

ProfitPilot is that missing layer: an AI business partner, not another dashboard.

## 2. Why Gemma 4 Is the Solution — Not Just In It (≈300 words) ⭐ HIGHEST-SCORING SECTION

Gemma 4 is the **orchestrator** of ProfitPilot, not a text-generation add-on. Three of its native capabilities are load-bearing:

**a) Native function calling → Gemma never guesses at numbers.**
Gemma decides *which* backend function to call — `find_profit_leaks()`, `simulate_pricing()`, `forecast_profit()`, `generate_email()`, `retrieve_knowledge()` — receives structured JSON, and reasons over verified computation. Every number in every answer traces to a deterministic ML function. This directly addresses the biggest weakness of LLM-only financial tools: hallucinated arithmetic.

<!-- FILL: paste one real function-call trace from your logs — the actual JSON Gemma emitted to call simulate_pricing(). Judges love seeing the raw call. -->

**b) Reasoning mode → explainable recommendations.**
We use Gemma 4's thinking mode for the Evidence Panel: every recommendation ships with Why → Supporting metrics → Retrieved guideline → Confidence score. The reasoning is surfaced, not hidden.

**c) RAG grounding → advice from trusted sources only.**
Gemma answers are grounded in a curated knowledge base (MSME India, SBA, Shopify, Stripe, HubSpot best-practice docs) retrieved via <!-- FILL: FAISS/ChromaDB --> — so "raise Product A's price 8%" cites an actual pricing-strategy guideline, not vibes.

<!-- IF YOU SHIPPED IT: add (d) Multimodal ingestion — photo of invoice/ledger → Gemma 4 vision extracts transactions directly, no OCR pipeline. If you didn't ship it, mention it in Future Scope instead — do NOT claim it here. -->

**Why not just any LLM?** Function calling + reasoning + 128K context in an open model we could <!-- FILL: how you accessed it — AI Studio / local / Kaggle --> within hackathon constraints. The architecture is Gemma-shaped: remove Gemma and there is no product, only disconnected ML scripts.

## 3. Architecture (≈150 words + diagram)

<!-- FILL: embed your architecture diagram image here -->

```
CSV/Excel upload
   ↓
ML Engine (Pandas + Scikit-learn/XGBoost)
   → profit leaks, customer risk, health score, forecast  [structured JSON]
   ↓
Gemma 4 Decision Engine
   ← function calling (5 tools)     ← RAG retrieval (vector DB)
   ↓
Evidence-backed recommendations
   ↓
React dashboard · What-if simulator · Chat + voice interface
```

Flow in one sentence: ML finds the patterns, RAG supplies the domain knowledge, Gemma reasons across both and speaks to the owner in plain language — through chat, voice, or a live what-if slider.

<!-- FILL: 2-3 sentences on the JSON contract between ML layer and Gemma (paste your actual schema snippet) — this is the "clear engineering" evidence -->

## 4. What Gemma Does at Each Step (≈150 words)

Walk one real query end-to-end:

> User asks: **"Why did my profit drop in June?"**
> 1. Gemma calls `find_profit_leaks(month="June")` → gets `{Product A: -₹22,000, cause: heavy discounting}`
> 2. Gemma calls `retrieve_knowledge("discount optimization")` → gets SBA pricing guideline chunk
> 3. Gemma reasons (thinking mode) and answers: cause + impact + recommendation + confidence
> 4. User: **"Draft an email about the late payments."** → Gemma calls `generate_email()` with conversation context

<!-- FILL: replace with your actual best demo transcript — verbatim, it's more convincing than description -->

## 5. Built in One Day — Challenges & Choices (≈200 words)

<!-- FILL honestly as you go tomorrow. Judges explicitly reward overcoming real 1-day-sprint challenges. Candidates: -->
<!-- • Which Gemma access path worked (and which didn't) -->
<!-- • Function-calling schema iterations before Gemma called tools reliably -->
<!-- • Why client-side conversation memory instead of a DB (speed > elegance) -->
<!-- • Why browser Web Speech API for voice UX while keeping Gemma as the reasoning engine -->
<!-- • Integration issues between the 3 modules and how the JSON contract saved you -->

Deliberate scope cuts: <!-- FILL: what you consciously didn't build and why — this reads as engineering maturity, not weakness -->

## 6. Tech Stack (bullet list, ≈50 words)

- **LLM:** Gemma 4 <!-- FILL: exact variant/size + access method -->
- **Backend:** FastAPI, Python, Pandas, Scikit-learn/XGBoost
- **RAG:** <!-- FILL: LangChain/LlamaIndex + FAISS/ChromaDB + embedding model -->
- **Frontend:** React, Tailwind, Recharts, Web Speech API
- **Deploy:** <!-- FILL -->

## 7. Impact & Future Scope (≈100 words)

<!-- FILL: one quantified claim from your demo data, e.g. "On our sample retailer's data, ProfitPilot surfaced ₹1.2L/month of recoverable leakage — 6.5% of revenue." -->

Future: Gemma 4's native audio input for accented, multilingual voice (140+ languages — critical for Indian SME owners); on-device deployment of smaller Gemma variants for data-privacy-sensitive businesses; invoice-photo ingestion via Gemma vision. <!-- keep only the ones you did NOT already ship -->

## 8. Links

- **GitHub (public):** <!-- FILL -->
- **Live demo:** <!-- FILL: hosted URL or video -->
- **Demo video:** <!-- FILL if separate -->

---
<!-- FINAL CHECKLIST before submitting:
[ ] Under 1,500 words (penalty above)
[ ] Track selected on Kaggle
[ ] Repo public + linked in Attachments → Project Links
[ ] Demo linked in Attachments
[ ] Devfolio submission ALSO done (separate + mandatory)
[ ] Every claim in §2 matches what's actually in the repo
[ ] At least one real function-call trace and one real transcript pasted in
-->
