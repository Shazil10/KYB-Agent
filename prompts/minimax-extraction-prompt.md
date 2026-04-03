# MiniMax extraction prompt

Extract from this corporate document text:

- entity name
- jurisdiction
- all owners/shareholders
- ownership percentages where available

Return JSON only in the following shape:

```json
{
  "entity_name": "",
  "jurisdiction": "",
  "owners": [
    {
      "name": "",
      "type": "company or human",
      "ownership_pct": 0
    }
  ]
}
```

No prose. No markdown. JSON only.
