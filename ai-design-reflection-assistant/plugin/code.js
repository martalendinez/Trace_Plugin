// Show UI
figma.showUI(__html__, { width: 380, height: 600 });

// Let UI know plugin loaded
figma.ui.postMessage({ type: "INIT", message: "Plugin loaded ✅" });

// Listen for selection changes
figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: "SELECTION_CHANGED",
      payload: null,
    });
    return;
  }

  const node = selection[0];

  figma.ui.postMessage({
    type: "SELECTION_CHANGED",
    payload: {
      id: node.id,
      name: node.name,
      type: node.type,
    },
  });
});

// Listen for messages FROM the UI (future use)
figma.ui.onmessage = (msg) => {
  if (msg.type === "PING") {
    figma.ui.postMessage({ type: "PONG" });
  }
};
