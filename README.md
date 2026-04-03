# KYB-Agent

## The Problem

Financial institutions and regulators struggle to identify the true owners behind complex networks of shell companies. A single business may be owned by another company, which is owned by yet another, making it nearly impossible to trace accountability — especially when Politically Exposed Persons (PEPs) or high-risk individuals are deliberately obscured behind layers of corporate structures.

## The Solution

KYB-Agent is an autonomous Know Your Business (KYB) agent that recursively resolves nested corporate ownership chains to surface the Ultimate Beneficial Owner (UBO). Given any company name, the agent walks the ownership graph until it reaches a human entity, flagging risk status along the way.

A mock corporate registry (`mock-registry.json`) seeds the system with realistic nested shell-company data, while a lightweight Express API (`/api/registry`) allows external automation tools to query individual entities by name.

## Architecture (Lovable, n8n, MiniMax, Crossmint)

- **Lovable** — Used to rapidly scaffold the front-end dashboard that displays UBO resolution results in a human-readable format.
- **n8n** — Orchestrates the multi-step ownership traversal workflow. Each step queries the `/api/registry` endpoint, checks whether the returned entity is a `Human` or `Company`, and loops until the UBO is found.
- **MiniMax** — Powers the AI reasoning layer that interprets risk flags (e.g., Politically Exposed Person status) and generates a plain-language compliance summary for each resolved UBO.
- **Crossmint** — Handles on-chain attestation of the resolved UBO result, minting a verifiable credential so the KYB finding can be shared with third parties without re-running the full resolution process.

## Hackathon Limitations

- The registry is a static mock (`mock-registry.json`) and does not reflect live company data from official registries such as Companies House or OpenCorporates.
- Circular ownership structures (e.g., Company A owns Company B which owns Company A) are not handled and would cause an infinite loop in the current n8n workflow.
- Authentication and rate-limiting are not implemented on the `/api/registry` endpoint; it is intended for trusted internal use only.
- The risk-scoring model is binary (flagged / not flagged) and does not account for partial ownership percentages or multi-shareholder structures.
- MiniMax summaries are generated at query time and are not persisted; re-running the workflow may produce slightly different wording for the same entity.

