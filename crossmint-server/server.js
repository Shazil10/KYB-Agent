const express = require("express");

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const CROSSMINT_API_KEY = process.env.CROSSMINT_API_KEY;
const CROSSMINT_COLLECTION_ID = process.env.CROSSMINT_COLLECTION_ID;
const CROSSMINT_ENV = process.env.CROSSMINT_ENV || "staging";
const CHAIN = "base-sepolia";
const PORT = process.env.PORT || 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractMintResult(data) {
  const inner = data?.data ?? data?.result ?? {};
  const nft = inner?.nft ?? {};

  const tokenId =
    inner?.tokenId ??
    inner?.token?.tokenId ??
    nft?.tokenId ??
    data?.tokenId ??
    null;

  const txHash =
    inner?.txId ??
    inner?.onChain?.txId ??
    nft?.onChain?.txId ??
    data?.txId ??
    null;

  return { tokenId, txHash };
}

app.get("/api/", (_req, res) => {
  res.json({
    success: true,
    message: "ClearOwn Crossmint mint server is running",
  });
});

app.post("/api/test-mint", (_req, res) => {
  res.json({
    success: true,
    action_id: "test-action-123",
    token_id: "test-token-123",
    tx_hash: "0xtest123abc456",
    explorer_url: "https://sepolia.basescan.org/tx/0xtest123abc456",
  });
});

app.post("/api/mint", async (req, res) => {
  try {
    const {
      ubo_name,
      entity,
      chain_depth,
      risk_summary,
      verified_at,
      recipient_email = "demo@clearown.com",
    } = req.body || {};

    if (!ubo_name || !entity) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: ubo_name and entity",
      });
    }

    const mintResponse = await fetch(
      `https://${CROSSMINT_ENV}.crossmint.com/api/2022-06-09/collections/${CROSSMINT_COLLECTION_ID}/nfts`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": CROSSMINT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: `email:${recipient_email}:${CHAIN}`,
          sendNotification: false,
          locale: "en-US",
          reuploadLinkedFiles: false,
          metadata: {
            name: `KYB Passport - ${entity}`,
            description: `Verified UBO: ${ubo_name} | Depth: ${chain_depth || 1} layers | ${risk_summary || "Verification complete"}`,
            image: "https://www.crossmint.com/assets/crossmint/logo.png",
            attributes: [
              { trait_type: "UBO Name", value: ubo_name },
              { trait_type: "Entity Name", value: entity },
              { trait_type: "Chain Depth", value: String(chain_depth || 1) },
              { trait_type: "Risk Summary", value: risk_summary || "Verification complete" },
              { trait_type: "Verification Date", value: verified_at || new Date().toISOString() },
              { trait_type: "Status", value: "VERIFIED" },
            ],
          },
        }),
      }
    );

    const mintData = await mintResponse.json();

    if (!mintResponse.ok) {
      return res.status(500).json({
        success: false,
        error: "Crossmint mint request failed",
        crossmint_status: mintResponse.status,
        details: mintData,
      });
    }

    const actionId = mintData.actionId || mintData.id;
    if (!actionId) {
      return res.status(500).json({
        success: false,
        error: "Crossmint did not return an action ID",
        details: mintData,
      });
    }

    for (let attempt = 0; attempt < 12; attempt += 1) {
      await sleep(2500);

      const actionResponse = await fetch(
        `https://${CROSSMINT_ENV}.crossmint.com/api/2022-06-09/actions/${actionId}`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": CROSSMINT_API_KEY,
            accept: "application/json",
          },
        }
      );

      const actionData = await actionResponse.json();
      const status = String(actionData?.status || actionData?.data?.status || "").toLowerCase();
      const { tokenId, txHash } = extractMintResult(actionData);

      if (status === "success" || status === "succeeded" || txHash) {
        return res.json({
          success: true,
          pending: false,
          action_id: actionId,
          token_id: tokenId,
          tx_hash: txHash,
          explorer_url: txHash ? `https://sepolia.basescan.org/tx/${txHash}` : null,
          raw_action: tokenId ? undefined : actionData,
        });
      }

      if (status === "failed" || status === "error") {
        return res.status(500).json({
          success: false,
          action_id: actionId,
          error: "Crossmint action failed",
          details: actionData,
        });
      }
    }

    return res.status(202).json({
      success: true,
      pending: true,
      action_id: actionId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown mint error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`ClearOwn Crossmint server listening on ${PORT}`);
});
