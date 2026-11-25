# AI on Upsolve It: plan

**Status: postponed.** Written on 25 November 2026. Nothing in this plan is in the site. The repository has no AI provider, no AI code and no AI settings.

## What the AI is for

A coach for problems you already failed. It gives hints and debugging help in the upsolve queue and in the session review. That fits what the site already stores: the cleaned problem statement, the code and sample results from the in-site editor, and each person's session history.

What it is not for:

- **A general chat box.** It costs the most and has nothing to do with upsolving.
- **Choosing problems.** The rating and tag rules already do this, and they are predictable.
- **Full solutions or AI-written problems.** The first removes the reason to upsolve. The second cannot be trusted to be correct.

## The one rule

No AI help during a live session, contest mode or a room. Otherwise the timings and the standings stop meaning anything. Help opens once the session has ended, and the server enforces this, not the page.

## Phases

Each phase ships on its own. Each later one builds on the one before.

### Phase 1: hint ladder

Three hints per problem, opened one at a time: a nudge, the key idea, then the full approach in words. Never code.

1. **Stored hints.** The first request for a problem asks the model for all three hints and saves them next to the problem. Everyone after that reads the saved copy. This is why a small free allowance is enough.
2. **Endpoint.** `POST /api/problems/hints` takes a problem and returns its three hints. It is a POST because the first request can spend the day's allowance.
3. **Live-session lock.** Refuse anyone who has an active session whose time is not up, or who is in a running room they have not left.
4. **Daily allowance, counted in MongoDB.** The rate limiter is in memory and resets on every deploy, so it cannot hold a daily number. Suggested start: 5 new problems per person and 30 for the whole site per day. Problems that already have hints stay open to everyone.
5. **Off without a key.** With no API key the endpoint says hints are not switched on. The feature can be deployed before a key exists.
6. **Page.** A Hint control on each upsolve row, and possibly in the session review. The layout is not chosen yet (see Open decisions).
7. **Tests.** With the model's answer replaced: the lock refuses, a second request makes no new model call, the allowance returns 429, a malformed answer is not saved.

### Phase 2: "why is my code wrong?"

The model gets the statement, the code and the failing sample. It points at the bug or gives a small input that breaks the code. It never rewrites the solution.

This needs one thing first: the editor only exists inside a live session and on `/try`. The upsolve page is rows only. So phase 2 starts by opening an upsolve problem in the solve workspace, which already takes a list of problems.

This is the part that costs something every time it is used, so it needs its own per-person daily allowance. It also sends the person's code to the provider, which the privacy page must say.

### Phase 3 (optional): session review paragraph

Replace the eight fixed sentences in `backend/src/modules/trainings/utils/insights.ts` with one written paragraph per finished session, stored on the session. The fixed sentences stay as the fallback when AI is off. Only worth doing if phases 1 and 2 get used.

## Model and provider

The plan is provider-neutral. Groq, Gemini and OpenRouter all accept the same OpenAI-style chat request, so the backend makes one plain HTTP call and the provider is three settings: base URL, API key and model. No SDK.

### Free options, as checked on 25 November 2026

Free tiers change often. Check each provider's own limits page before building.

| Provider | Free model | Reported free limit | Catch |
| --- | --- | --- | --- |
| Groq | `openai/gpt-oss-120b` | 30 requests a minute, 1,000 requests a day, 8K tokens a minute, 200K tokens a day | The token limit is the real ceiling: about 40 hint generations a day |
| Google Gemini | `gemini-3.8-flash`, `gemini-3.5-flash-lite` | About 20 a day for Flash, about 500 a day for Flash-Lite | Google uses free-tier content to improve its products |
| OpenRouter | the `:free` models | 50 requests a day, or 1,000 a day after a one-time $10 top-up | Shared across all free models; models come and go |
| Cloudflare Workers AI | open models | 10,000 "neurons" a day | Smaller models, weaker on hard problems |

How sure these numbers are:

- **Groq:** read from Groq's own rate-limits and model pages. The account's limits page in the Groq console is the final word.
- **Gemini:** Google's pricing page confirms which models are free and that free content is used to improve its products. The daily limits are only shown inside AI Studio, so 20 and 500 come from blogs.
- **OpenRouter and Cloudflare:** blog figures only.
- **No longer free:** GitHub Models was retired in July 2026. Sources disagree on whether Cerebras and Mistral still have a free API tier.

The chosen starting point was **Groq with `openai/gpt-oss-120b`**. It is enough for phase 1. It is not enough for phase 2: hints and debugging answers would share about 40 model calls a day across the whole site.

### Paid options

Rough estimates from list prices on the same date:

| | Claude Opus 5.5 | Claude Haiku 5.5 |
| --- | --- | --- |
| Hints, once per problem | about 7 cents | about 0.2 cents |
| One debugging answer | about 5 to 7 cents | about 0.2 cents |
| 1,000 problems hinted | about $70, one time | about $2, one time |

A paid model has no daily ceiling and is stronger on hard problems. If the free tier turns out too limiting, Haiku 5.5 is the cheapest step up.

## Risks and guards

- **Wrong hints.** A free model is weaker on hard problems, and a wrong hint is worse than none. Test the model on about 20 problems you know well before switching it on. A "Report this hint" link that removes a stored hint is an open decision below.
- **Untrusted input.** The statement comes from a judge and the code comes from a user. Show the model's answer as plain text, never as HTML.
- **Cost.** The site-wide daily ceiling is the kill switch.
- **The API key.** It is set by the owner as a Fly secret and in `backend/.env`. It is never committed.

## Open decisions

1. **Hint layout.** Three working versions are in a picker: under the row, three seals side by side, or one hint at a time over the queue. https://claude.ai/artifact/4yaXpiXmGn88UCRQh2xxVo
2. **Hints in the session review too,** or on the upsolve queue only.
3. **A "Report this hint" link,** or not for now.
4. **Free or paid model** for phase 2.

## What already exists

A first draft of the phase 1 backend was written on 25 November 2026 and then set aside when the work was postponed. It is not on any branch. It sits in a git stash on the machine it was written on:

```
ai-hints: phase 1 backend draft (2026-11-25), not for main yet
```

It covers steps 1 to 5 and 7 of phase 1: the model call, the stored hints, the endpoint, the lock, the allowance, and six tests that passed with the model's answer replaced. It never made a real call to a model. To bring it back, run `git stash list` to find it and `git stash apply` on it. If the stash is gone, this plan is enough to write it again.

## Sources

- Groq rate limits: https://console.groq.com/docs/rate-limits
- Groq models: https://console.groq.com/docs/models
- Gemini API pricing: https://aistudio.google.com/docs/pricing
- Gemini API rate limits: https://aistudio.google.com/docs/rate-limits
- OpenRouter free tier (blog): https://klymentiev.com/blog/openrouter-free-tier
- Free LLM APIs compared (blog): https://www.requesty.ai/blog/free-llm-apis
