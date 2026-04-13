figma.showUI(__html__, { width: 380, height: 600 });

// Notify UI plugin loaded
figma.ui.postMessage({ type: "INIT", message: "Plugin loaded ✅" });

// Send selection info to UI
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

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

// TEXT NODES
function collectTextNodes(root) {
  const texts = [];

  function walk(n) {
    if (n.type === "TEXT") {
      texts.push({
        id: n.id,
        name: n.name,
        characters: n.characters,
      });
    }
    if ("children" in n && Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
  }

  walk(root);
  return texts;
}

// COMPONENT STRUCTURE
function extractComponentStructure(node) {
  return {
    name: node.name,
    type: node.type,
    hasAutoLayout: node.layoutMode !== undefined,
    layoutMode: node.layoutMode || null,
    primaryAxisSizing: node.primaryAxisSizingMode || null,
    counterAxisSizing: node.counterAxisSizingMode || null,
    children: (node.children || []).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    })),
  };
}

// STYLE TOKENS
function extractStyleTokens(node) {
  return {
    fills: node.fills || null,
    strokes: node.strokes || null,
    strokeWeight: node.strokeWeight || null,
    cornerRadius: node.cornerRadius || null,
    padding: {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0,
    },
    spacing: node.itemSpacing || null,
    textStyles: collectTextNodes(node).map((t) => ({
      id: t.id,
      name: t.name,
      characters: t.characters,
    })),
  };
}

// ACCESSIBILITY (Hybrid)
function extractAccessibility(node) {
  const textNodes = collectTextNodes(node);

  return {
    textSizes: textNodes.map((t) => ({
      id: t.id,
      name: t.name,
      characters: t.characters,
    })),
    tapTargets: (node.children || [])
      .filter((c) => c.width < 44 || c.height < 44)
      .map((c) => ({
        id: c.id,
        name: c.name,
        width: c.width,
        height: c.height,
      })),
  };
}

// INTERACTIONS
function extractInteractions(node) {
  return {
    interactions: node.reactions || [],
  };
}

// IMAGES & ICONS
function extractImagesAndIcons(node) {
  const results = [];

  function walk(n) {
    if (n.fills && Array.isArray(n.fills)) {
      n.fills.forEach((f) => {
        if (f.type === "IMAGE") {
          results.push({
            id: n.id,
            name: n.name,
            type: "image",
          });
        }
      });
    }

    if (n.type === "COMPONENT" || n.type === "INSTANCE") {
      if (n.name.toLowerCase().includes("icon")) {
        results.push({
          id: n.id,
          name: n.name,
          type: "icon",
        });
      }
    }

    if ("children" in n && Array.isArray(n.children)) {
      n.children.forEach(walk);
    }
  }

  walk(node);
  return results;
}

/* -------------------------------------------------------
   MAIN MESSAGE HANDLER
------------------------------------------------------- */

figma.ui.onmessage = function (msg) {
  if (msg.type === "PING") {
    figma.ui.postMessage({ type: "PONG" });
  }

  if (msg.type === "REQUEST_CONTEXT") {
    var selectionId = msg.selectionId;
    var contextSelection = msg.contextSelection || [];

    var node = selectionId ? figma.getNodeById(selectionId) : null;

    if (!node || !("children" in node)) {
      figma.ui.postMessage({
        type: "CONTEXT_RESULT",
        payload: null,
      });
      return;
    }

    var designContext = {};

    // SELECTED FRAME
    if (contextSelection.indexOf("selected-ui") !== -1) {
      designContext.frame = {
        id: node.id,
        name: node.name,
        type: node.type,
        width: node.width,
        height: node.height,
        childrenCount: node.children ? node.children.length : 0,
      };
    }

    // TEXT CONTENT
    if (contextSelection.indexOf("text-content") !== -1) {
      designContext.textContent = collectTextNodes(node);
    }

    // COMPONENT STRUCTURE
    if (contextSelection.indexOf("component-structure") !== -1) {
      designContext.componentStructure = extractComponentStructure(node);
    }

    // STYLE TOKENS
    if (contextSelection.indexOf("style-tokens") !== -1) {
      designContext.styleTokens = extractStyleTokens(node);
    }

    // ACCESSIBILITY
    if (contextSelection.indexOf("accessibility") !== -1) {
      designContext.accessibility = extractAccessibility(node);
    }

    // INTERACTIONS
    if (contextSelection.indexOf("interactions") !== -1) {
      designContext.interactions = extractInteractions(node);
    }

    // IMAGES & ICONS
    if (contextSelection.indexOf("images-icons") !== -1) {
      designContext.imagesAndIcons = extractImagesAndIcons(node);
    }

    figma.ui.postMessage({
      type: "CONTEXT_RESULT",
      payload: { designContext },
    });
  }
};
