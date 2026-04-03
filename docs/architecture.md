# Architecture

## System overview

ClearOwn is a hybrid agentic compliance product. The workflow spans multiple tools, each chosen for a specific job:

- Lovable handles presentation, user interaction, and the guided demo flow
- n8n handles orchestration, recursion, and workflow state
- MiniMax extracts structured ownership information from messy text/documents
- Crossmint issues the final portable KYB credential
- Replit hosts the lightweight mint service used by the frontend during the hackathon

## End-to-end flow

### 1. Investigation intake

The user enters:

- entity name
- jurisdiction
- optional document text

Lovable sends the investigation request to n8n via webhook.

### 2. MiniMax extraction + recursive ownership tracing

n8n:

1. passes the document text to MiniMax
2. extracts:
   - entity name
   - jurisdiction
   - owners/shareholders
   - ownership percentages when available
3. determines whether the current owner is:
   - a human -> stop
   - another company -> recurse
4. repeats this until a human owner is reached or the loop max depth is hit

### 3. Risk scoring

Each ownership layer is tagged with a jurisdiction risk level.

Example:

- BVI -> high
- Cayman -> high
- Delaware -> low/medium depending on logic

### 4. Results UI

Lovable renders:

- UBO summary
- risk summary
- ownership chain
- investigation completion state

### 5. Credential issuance

When the user clicks `Issue KYB Passport`, Lovable calls the Replit-hosted mint service, which:

1. validates request data
2. sends a mint request to Crossmint
3. polls the action status
4. returns:
   - action ID
   - token ID when available
   - transaction hash
   - explorer link

### 6. On-chain proof

The minted credential is issued on Base Sepolia and can be shown as:

- Crossmint collection item
- BaseScan transaction / token detail page

## Design principle

The public landing page and in-app product flow are intentionally split:

- public page: enterprise cybersecurity / compliance marketing feel
- in-app flow: investigation, results, and credential issuance

This gives judges a polished first impression plus a concrete product walkthrough.
