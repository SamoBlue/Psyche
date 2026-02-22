/*
Branching Dialogue Editor (single-file React component)

How to use:
- Create a new Vite + React project or CRA, paste this component into src/App.jsx (replace existing), ensure Tailwind is configured.
- This is a simple, local editor that stores your dialogue in localStorage. You can Export JSON, Import JSON, or Export Plain Text for a read-only viewer.
- Editor access is protected by a simple password prompt (default: "admin"). This is not secure for public hosting—it's just to prevent accidental editing. If you want true access control, deploy behind authenticated hosting.

Features implemented:
- Create/edit dialogue nodes (id, rich text content via contentEditable)
- Add choices from one node to another (branching)
- Color selected text using a color input (wraps selection in <span style="color:...">)
- Live preview inside editor
- Export full JSON (editable for you later) and Export Plain Text (for the viewer)
- Read-only Viewer mode that loads JSON and allows following branches

Limitations & notes:
- contentEditable HTML is used for rich text; exported plain text strips HTML (simple). If you need more advanced styling or formatting, consider integrating a rich-text editor like TipTap or Slate.
- The password lock is client-side only.
- The exported plain text format is human-readable and suitable for your viewers to read, but it will lose color. If you want color in the viewer while keeping it non-editable, export HTML instead.

*/

import React, { useState, useEffect, useRef } from "react";

// Simple unique id generator
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_NODE = () => ({ id: uid(), title: "Start", content: "<div>Write your dialogue here...</div>", choices: [] });

export default function App() {
  const [dialogue, setDialogue] = useState(() => {
    try {
      const raw = localStorage.getItem("dialogue_v1");
      return raw ? JSON.parse(raw) : { nodes: [DEFAULT_NODE()], startNodeId: null };
    } catch (e) {
      return { nodes: [DEFAULT_NODE()], startNodeId: null };
    }
  });
  const [selectedNodeId, setSelectedNodeId] = useState(() => dialogue.nodes[0]?.id || null);
  const [mode, setMode] = useState("editor"); // 'editor' or 'viewer'
  const [editorUnlocked, setEditorUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [viewerNodeId, setViewerNodeId] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("dialogue_v1", JSON.stringify(dialogue));
  }, [dialogue]);

  useEffect(() => {
    if (!selectedNodeId && dialogue.nodes.length) setSelectedNodeId(dialogue.nodes[0].id);
  }, [dialogue.nodes]);

  const findNode = (id) => dialogue.nodes.find((n) => n.id === id);

  function updateNode(id, patch) {
    setDialogue((d) => ({
      ...d,
      nodes: d.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  }

  function addNode() {
    const node = { id: uid(), title: "New node", content: "<div>New text</div>", choices: [] };
    setDialogue((d) => ({ ...d, nodes: [...d.nodes, node] }));
    setSelectedNodeId(node.id);
  }

  function deleteNode(id) {
    setDialogue((d) => ({ ...d, nodes: d.nodes.filter((n) => n.id !== id) }));
    if (selectedNodeId === id) setSelectedNodeId(null);
    // Remove choices that point to this node
    setDialogue((d) => ({
      ...d,
      nodes: d.nodes.map((n) => ({
        ...n,
        choices: n.choices.filter((c) => c.target !== id),
      })),
    }));
  }

  function addChoice(fromId) {
    const label = prompt("Choice label (what the player sees)") || "Choice";
    const targetId = prompt("Target node id (or type NEW to create a new node)") || "";
    if (targetId.toUpperCase() === "NEW") {
      const newNode = { id: uid(), title: "New node", content: "<div>New text</div>", choices: [] };
      setDialogue((d) => ({ ...d, nodes: [...d.nodes, newNode] }));
      setDialogue((d) => ({
        ...d,
        nodes: d.nodes.map((n) => (n.id === fromId ? { ...n, choices: [...n.choices, { label, target: newNode.id }] } : n)),
      }));
      return;
    }
    // check exists
    if (!findNode(targetId)) {
      alert("No node with that id. You can copy an id from the node list or type NEW.");
      return;
    }
    updateNode(fromId, { choices: [...findNode(fromId).choices, { label, target: targetId }] });
  }

  function removeChoice(nodeId, index) {
    const node = findNode(nodeId);
    if (!node) return;
    const newChoices = node.choices.slice();
    newChoices.splice(index, 1);
    updateNode(nodeId, { choices: newChoices });
  }

  function onContentInput(e) {
    const html = e.currentTarget.innerHTML;
    updateNode(selectedNodeId, { content: html });
  }

  function applyColorToSelection(color) {
    // This uses the deprecated execCommand for simplicity, but it works in most browsers.
    // It wraps the selected text in a <span style="color:...">
    try {
      document.execCommand("foreColor", false, color);
      // sync content
      const html = contentRef.current?.innerHTML || "";
      updateNode(selectedNodeId, { content: html });
    } catch (e) {
      // fallback: attempt manual wrap
      const sel = document.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const span = document.createElement("span");
        span.style.color = color;
        try {
          range.surroundContents(span);
          const html = contentRef.current?.innerHTML || "";
          updateNode(selectedNodeId, { content: html });
        } catch (err) {
          alert("Sorry, could not apply color to this selection. Try selecting whole nodes of text.");
        }
      }
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(dialogue, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dialogue.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPlainText() {
    // Produce a readable plain-text export of nodes and their choices.
    const lines = [];
    for (const node of dialogue.nodes) {
      lines.push(`NODE ${node.id} - ${node.title}`);
      // strip HTML tags
      const txt = node.content.replace(/<[^>]+>/g, "");
      lines.push(txt.trim());
      if (node.choices.length) {
        for (const c of node.choices) {
          lines.push(`- CHOICE: ${c.label} -> ${c.target}`);
        }
      }
      lines.push("\n");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dialogue.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSONFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setDialogue(parsed);
        alert("Imported dialogue successfully.");
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  function viewerLoadJSON() {
    setMode("viewer");
    setViewerNodeId(dialogue.nodes[0]?.id || null);
    setEditorUnlocked(false);
  }

  function toggleEditorUnlock() {
    const pw = prompt("Enter editor password (default 'admin')");
    if (pw === null) return;
    if (pw === "admin") {
      setEditorUnlocked(true);
      setMode("editor");
      alert("Editor unlocked for this session.");
    } else {
      alert("Wrong password. (Change password behavior requires modifying code.)");
    }
  }

  // Simple plain-text viewer load (best-effort parsing)
  function loadPlainTextAsViewer(text) {
    // This function attempts to parse our plain text export. If it can't, it just shows the whole text as a single node.
    const parts = text.split(/\nNODE\s+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) {
      // treat whole file as single node
      setDialogue({ nodes: [{ id: uid(), title: "Imported text", content: `<div>${text.replace(/\n/g, '<br/>')}</div>`, choices: [] }], startNodeId: null });
      setMode("viewer");
      setViewerNodeId(dialogue.nodes[0]?.id || null);
      return;
    }

    const nodes = [];
    for (const part of parts) {
      // part starts like "<id> - title\n..."
      const firstLineEnd = part.indexOf('\n');
      const header = firstLineEnd === -1 ? part : part.slice(0, firstLineEnd);
      const rest = firstLineEnd === -1 ? '' : part.slice(firstLineEnd + 1);
      const m = header.match(/^([A-Za-z0-9]+)\s*-\s*(.*)$/);
      const id = m ? m[1] : uid();
      const title = m ? m[2] : 'Node';
      const contentHtml = `<div>${rest.replace(/\n/g, '<br/>')}</div>`;
      nodes.push({ id, title, content: contentHtml, choices: [] });
    }
    setDialogue({ nodes, startNodeId: nodes[0]?.id || null });
    setMode("viewer");
    setViewerNodeId(nodes[0]?.id || null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-white p-3 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Dialogue Nodes</h2>
          <div className="space-y-2 max-h-96 overflow-auto">
            {dialogue.nodes.map((n) => (
              <div
                key={n.id}
                className={`p-2 rounded-md cursor-pointer ${selectedNodeId === n.id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedNodeId(n.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500">id: {n.id}</div>
                  </div>
                  <div className="space-x-1">
                    <button
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      onClick={(e) => { e.stopPropagation(); const t = prompt('New title', n.title); if (t !== null) updateNode(n.id, { title: t }); }}
                    >
                      rename
                    </button>
                    <button
                      className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this node?')) deleteNode(n.id); }}
                    >
                      del
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">{n.choices.length} choices</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex space-x-2">
            <button className="flex-1 py-2 rounded bg-indigo-600 text-white" onClick={addNode}>Add node</button>
            <button className="py-2 px-3 rounded bg-gray-200" onClick={() => { setDialogue({ nodes: [DEFAULT_NODE()], startNodeId: null }); setSelectedNodeId(null); }}>Reset</button>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Save / Export</h3>
            <div className="flex gap-2 mt-2">
              <button className="py-2 px-3 rounded bg-green-600 text-white" onClick={exportJSON}>Export JSON</button>
              <button className="py-2 px-3 rounded bg-yellow-500 text-white" onClick={exportPlainText}>Export Plain Text</button>
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-600">Import JSON</label>
              <input type="file" accept="application/json" onChange={(e) => importJSONFile(e.target.files[0])} />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Modes</h3>
            <div className="flex gap-2 mt-2">
              <button className={`py-2 px-3 rounded ${mode === 'editor' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`} onClick={() => { setMode('editor'); }}>Editor</button>
              <button className={`py-2 px-3 rounded ${mode === 'viewer' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`} onClick={viewerLoadJSON}>Viewer</button>
            </div>
            <div className="mt-2 text-xs text-gray-500">Viewer shows a read-only traversal of your dialogue.
            </div>
            <div className="mt-2">
              <button className="py-1 px-2 rounded bg-gray-100" onClick={toggleEditorUnlock}>Unlock Editor</button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Tip: use the node list to see node ids (you can copy them). For quicker branching, when adding a choice type NEW as target to create a new node automatically.
          </div>
        </div>

        <div className="md:col-span-3 bg-white p-4 rounded-2xl shadow-sm">
          {mode === 'editor' ? (
            <>
              <h2 className="text-xl font-semibold">Editor</h2>
              {!editorUnlocked ? (
                <div className="mt-4 p-4 bg-yellow-50 rounded">Editor is locked. Click <button onClick={toggleEditorUnlock} className="underline text-blue-600">Unlock Editor</button> to continue. (default password: 'admin')</div>
              ) : (
                <>{selectedNodeId ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <input className="border rounded px-2 py-1 flex-1" value={findNode(selectedNodeId)?.title || ''} onChange={(e) => updateNode(selectedNodeId, { title: e.target.value })} />
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Color</label>
                          <input type="color" onChange={(e) => applyColorToSelection(e.target.value)} />
                        </div>
                      </div>

                      <div
                        ref={contentRef}
                        onInput={onContentInput}
                        contentEditable
                        suppressContentEditableWarning
                        dir="ltr"
                        style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}
                        className="min-h-[200px] border rounded p-3 bg-white"
                        dangerouslySetInnerHTML={{ __html: findNode(selectedNodeId)?.content || '' }}
                      />

                      <div className="mt-3">
                        <h4 className="font-medium">Choices</h4>
                        <div className="space-y-2 mt-2">
                          {findNode(selectedNodeId)?.choices.map((c, i) => (
                            <div key={i} className="flex justify-between items-center border rounded p-2">
                              <div>
                                <div className="text-sm">{c.label}</div>
                                <div className="text-xs text-gray-500">- {c.target}</div>
                              </div>
                              <div className="flex gap-2">
                                <button className="text-xs px-2 py-1 rounded bg-gray-100" onClick={() => { const newLabel = prompt('Edit label', c.label); if (newLabel !== null) { const node = findNode(selectedNodeId); const copy = node.choices.slice(); copy[i] = { ...copy[i], label: newLabel }; updateNode(selectedNodeId, { choices: copy }); } }}>edit</button>
                                <button className="text-xs px-2 py-1 rounded bg-red-100" onClick={() => removeChoice(selectedNodeId, i)}>del</button>
                              </div>
                            </div>
                          ))}

                          <div>
                            <button className="py-1 px-2 rounded bg-indigo-600 text-white" onClick={() => addChoice(selectedNodeId)}>Add choice</button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="py-2 px-3 rounded bg-green-600 text-white" onClick={() => { alert('Saved to localStorage. Use Export JSON to download.'); }}>Save</button>
                        <button className="py-2 px-3 rounded bg-gray-200" onClick={() => { const html = findNode(selectedNodeId)?.content || ''; navigator.clipboard.writeText(html); alert('Node HTML copied to clipboard'); }}>Copy HTML</button>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <div className="mb-3">
                        <h4 className="font-medium">Node Preview</h4>
                        <div className="border rounded p-3 min-h-[150px]" dangerouslySetInnerHTML={{ __html: findNode(selectedNodeId)?.content || '' }} />
                      </div>

                      <div>
                        <h4 className="font-medium">Raw JSON</h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(findNode(selectedNodeId) || {}, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>Select a node to edit it.</div>
                )}</>
              )}
            </>
          ) : (
            // Viewer mode
            <div>
              <h2 className="text-xl font-semibold">Viewer (read-only)</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="border rounded p-4 min-h-[240px] bg-white">
                    {(() => {
                      const node = findNode(viewerNodeId) || dialogue.nodes[0];
                      if (!node) return <div>No nodes to view.</div>;
                      return (
                        <div>
                          <div className="text-lg font-medium mb-2">{node.title}</div>
                          <div className="prose" dangerouslySetInnerHTML={{ __html: node.content }} />
                          <div className="mt-4">
                            {node.choices.length ? (
                              node.choices.map((c, i) => (
                                <button key={i} className="mr-2 mb-2 px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => setViewerNodeId(c.target)}>{c.label}</button>
                              ))
                              ) : (
                                <div className="text-sm text-gray-500">(No choices - end of branch)</div>
                              )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button className="py-2 px-3 rounded bg-gray-200" onClick={() => { setViewerNodeId(dialogue.nodes[0]?.id || null); }}>Restart</button>
                    <button className="py-2 px-3 rounded bg-blue-500 text-white" onClick={() => { const txt = prompt('Paste plain-text dialogue export here to load in viewer'); if (txt) loadPlainTextAsViewer(txt); }}>Load plain text</button>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <h4 className="font-medium">Navigation</h4>
                  <div className="mt-2 space-y-2 max-h-[360px] overflow-auto">
                    {dialogue.nodes.map((n) => (
                      <div key={n.id} className="p-2 border rounded flex justify-between items-center">
                        <div>
                          <div className="text-sm">{n.title}</div>
                          <div className="text-xs text-gray-500">id: {n.id}</div>
                        </div>
                        <div>
                          <button className="text-xs px-2 py-1 rounded bg-gray-100" onClick={() => setViewerNodeId(n.id)}>open</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
