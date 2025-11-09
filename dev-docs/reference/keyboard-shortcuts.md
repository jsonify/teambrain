# Keyboard Shortcuts Reference

Quick reference for all TeamBrain keyboard shortcuts.

## Primary Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| **Search Knowledge Base** | `Cmd+Shift+K` | `Ctrl+Shift+K` |
| **Ask Question (AI)** | `Cmd+Shift+?` | `Ctrl+Shift+?` |
| **Toggle Sidebar** | `Cmd+Option+T` | `Ctrl+Alt+T` |

## Navigation Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| **Next Suggestion** | `Cmd+]` | `Ctrl+]` |
| **Previous Suggestion** | `Cmd+[` | `Ctrl+[` |
| **Focus Sidebar** | `Cmd+0` | `Ctrl+0` |

## Quick Actions

| Action | Shortcut |
|--------|----------|
| **Refresh Index** | No default (use Command Palette) |
| **Clear Cache** | No default (use Command Palette) |
| **Sign Out** | No default (use Command Palette) |

## Command Palette

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| **Open Command Palette** | `Cmd+Shift+P` | `Ctrl+Shift+P` |

Then type "TeamBrain:" to see all commands.

## Search Shortcuts

When search Quick Pick is open:

| Action | Shortcut |
|--------|----------|
| **Navigate results** | `↑` / `↓` |
| **Select result** | `Enter` |
| **Cancel** | `Esc` |
| **Open in browser** | `Cmd/Ctrl+Enter` |

## TreeView Shortcuts

When sidebar is focused:

| Action | Shortcut |
|--------|----------|
| **Navigate items** | `↑` / `↓` |
| **Expand/Collapse** | `→` / `←` |
| **Open item** | `Enter` |
| **Context menu** | Right-click or `Shift+F10` |

## Customizing Shortcuts

### Via Keyboard Shortcuts UI

1. `Cmd/Ctrl+K` then `Cmd/Ctrl+S`
2. Search for "TeamBrain"
3. Click pencil icon to edit
4. Press desired key combination
5. Press `Enter` to save

### Via keybindings.json

```json
{
  "key": "cmd+k",
  "command": "teambrain.search",
  "when": "!inDebugMode"
}
```

## Recommended Shortcuts

If default shortcuts conflict with other extensions:

### Alternative Search Shortcut

```json
{
  "key": "cmd+shift+t",
  "command": "teambrain.search"
}
```

### Alternative Ask Shortcut

```json
{
  "key": "cmd+shift+a",
  "command": "teambrain.askQuestion"
}
```

## Printable Cheat Sheet

```
┌─────────────────────────────────────────────────────┐
│         TeamBrain Keyboard Shortcuts                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  PRIMARY ACTIONS                                    │
│  ───────────────                                    │
│  Cmd+Shift+K    Search Knowledge Base              │
│  Cmd+Shift+?    Ask AI Question                    │
│  Cmd+Opt+T      Toggle Sidebar                     │
│                                                     │
│  NAVIGATION                                         │
│  ──────────                                         │
│  Cmd+]          Next Suggestion                     │
│  Cmd+[          Previous Suggestion                 │
│  ↑ / ↓          Navigate in lists                   │
│  Enter          Select/Open                         │
│  Esc            Cancel/Close                        │
│                                                     │
│  COMMAND PALETTE                                    │
│  ───────────────                                    │
│  Cmd+Shift+P    Open Command Palette               │
│                 Type "TeamBrain:" for all commands  │
│                                                     │
│  (Windows/Linux: Replace Cmd with Ctrl)            │
└─────────────────────────────────────────────────────┘
```

## Conflicts with Other Extensions

Common shortcut conflicts and solutions:

### Conflict: `Cmd+Shift+K` (Delete Line)

**Solution 1:** Use Command Palette instead

**Solution 2:** Rebind TeamBrain search:
```json
{
  "key": "cmd+shift+f",
  "command": "teambrain.search"
}
```

### Conflict: `Cmd+Shift+?` (Show All Commands)

**Solution:** Rebind Ask Question:
```json
{
  "key": "cmd+shift+a",
  "command": "teambrain.askQuestion"
}
```

## When Shortcuts

Shortcuts can be context-aware. Example:

```json
{
  "key": "cmd+shift+k",
  "command": "teambrain.search",
  "when": "!editorFocus"
}
```

Only triggers when editor not focused.

## Related Documents

- [Commands Reference](commands.md)
- [Configuration](configuration.md)
- [Features Specification](../design/features.md)

---

**Tip:** Print this reference or keep it handy while learning TeamBrain!
