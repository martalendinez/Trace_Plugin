const { Router } = require("express");
const router = Router();

/** @type {import("express").RequestHandler} */
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    res.json({
      options: [
        {
          id: "mock_option_1",
          title: "Mock Option",
          summary: "This is a placeholder option from the backend.",
          problem: "Mock problem",
          assumption: "Mock assumption",
          principle: "Mock principle",
          tradeoff: "Mock tradeoff",
          suggestedChanges: [],
        },
      ],
      critiques: [],
      improvements: [],
      changeInstructions: [],
    });
  } catch (err) {
    console.error("Error in /api/reflect:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

module.exports = router;
