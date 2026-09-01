---
"agentic-auto-correct": patch
"@agentic-auto-correct/adapter-anthropic": patch
"@agentic-auto-correct/adapter-openai": patch
"@agentic-auto-correct/react": patch
---

Add `repository` field to each package's package.json. npm's provenance verification checks this against the repo that issued the CI's OIDC token, and rejected publishes with an empty `repository.url`.
