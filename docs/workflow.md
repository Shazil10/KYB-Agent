# Workflow

## Demo workflow

The intended demo sequence is:

1. Start on the ClearOwn landing page
2. Introduce the problem:
   recursive shell-company ownership is slow and manual
3. Click `Launch Investigation`
4. Show the investigation/loading sequence
5. Show the final results page
6. Highlight:
   - identified UBO
   - number of layers
   - risk jurisdictions
7. Click `Issue KYB Passport`
8. Show the credential card
9. Open BaseScan to prove mint completion

## Operational workflow

### Lovable

- receives entity input
- triggers webhook
- shows investigation state
- renders final result
- calls mint API

### n8n

- receives Lovable payload
- triggers MiniMax extraction
- runs recursion loop
- scores jurisdictions
- returns result JSON

### Crossmint service

- receives final verification payload
- creates credential metadata
- submits mint request
- polls completion
- returns action/transaction information

## Payload contracts

Canonical contract samples are in:

- [investigation request](/Users/shazilfarukh/Desktop/KYB-Agent/samples/investigation-request.json)
- [investigation response](/Users/shazilfarukh/Desktop/KYB-Agent/samples/investigation-response.json)
- [mint request](/Users/shazilfarukh/Desktop/KYB-Agent/samples/mint-request.json)
- [mint response](/Users/shazilfarukh/Desktop/KYB-Agent/samples/mint-response.json)
