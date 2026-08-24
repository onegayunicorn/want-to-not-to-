# Learning Commons — product vision and build map

## Cover
# Learning Commons
A place to leave something useful for the next person.

## Slide 1 — The product promise
**People are anonymous. Ideas are visible.**

Learning Commons is intentionally not an AI social network. It avoids profiles, popularity, likes, followers, and identity trails.

The public object is the learning trace: content that another reader can notice, test, or carry forward.

## Slide 2 — The Write view
**Write / listen / share**

The composer keeps the original words intact and supports a 360-character trace.

Prompt chips help a writer begin with four useful forms: I learned, A method, An experiment, and An idea.

A private guide helps the writer clarify without rewriting, diagnosing, judging, or becoming the author.

## Slide 3 — Conversational guide
**From internal reaction to observable event**

Opening question: “What are you trying to capture here?”

When emotional language appears, the guide asks: “Can we look at what happened rather than the feeling it produced?”

The next prompts are concrete: What did you notice? What did you do? What changed? What might you try next time?

Pathway: notice → act → change → try next.

## Slide 4 — Commons reading arrangements
**Three ways to gather**

Quiet shelf: a broad scan of many learning traces and recurring patterns.

Study table: a smaller, calmer grouping for comparing notes.

Loose notes: one focused trace at a time with bounded previous/next navigation and reading-time context.

All arrangements preserve content-only public metadata.

## Slide 5 — Idea Map
**Semantic proximity, never social connection**

The Map / ideas view places notes in a spatial field. Lines and proximity suggest conceptual similarity between words and methods, not relationships between people.

Controls: zoom in, zoom out, reset, and click-through from an idea node into focused reading.

Future direction: replace the prototype’s deterministic positions with moderated semantic clustering.

## Slide 6 — Architecture and growth
**Strength first, then scale**

Core flow: Learning Commons → Write / Commons → private guide and content-only trace → Shelf, Map, Card.

Strengths to protect: original words, next-reader value, anonymity, and no social graph.

Growth pathways: conversational prompts → semantic clustering → moderation and safety metrics → optional collaborative studies.

The architecture map shows how each growth step is protected by the original principles.

## Slide 7 — Deployment for public testing
**Zero-build static hosting**

Vercel: import the GitHub repository, keep the project root at the repository root, leave the build command empty, and publish the static files. Each push can create a preview deployment.

Netlify: add a new site from Git, select the repository, leave the build command empty, set the publish directory to the repository root, and deploy. Netlify Drop can also publish a local folder for a quick test.

Suggested testing loop: deploy a preview → test Write, Quiet shelf, Study table, Loose notes, and Map / ideas → collect feedback → merge only reviewed changes.

## Slide 8 — Definition of ready
**A calm, testable commons**

The guide redirects feeling-language toward observable events and actions.

The 360-character boundary is enforced before asking and before sharing.

Shelf, Map, and Card routes are keyboard reachable and visually coherent on mobile and desktop.

The public data model remains content-only, with future moderation and rate limiting treated as explicit production work.

