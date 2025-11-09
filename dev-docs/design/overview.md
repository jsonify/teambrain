# TeamBrain - Design Overview

**Version:** 1.0
**Last Updated:** 2025-11-09
**Status:** Design Phase

## Executive Summary

TeamBrain is a VS Code extension that brings your team's Google Drive knowledge base directly into your development environment. By leveraging VS Code's built-in authentication system and the Language Model API (Copilot), it provides intelligent, context-aware access to your organization's documentation, wikis, ADRs, runbooks, and other knowledge artifacts.

## Problem Statement

Platform engineers spend significant time context-switching between their IDE and Google Drive to find relevant documentation:

- **Time Waste:** 15-30 minutes daily searching for docs across multiple Google Drive folders
- **Context Loss:** Breaking flow to search, read, and return to coding
- **Knowledge Silos:** Difficulty discovering relevant docs that exist but aren't known
- **Stale Knowledge:** Unaware when documentation exists for the code being worked on
- **Onboarding Friction:** New team members don't know what docs exist or where to find them

**Current Impact:** Reduced productivity, repeated questions, slower incident resolution, longer onboarding.

## Value Proposition

**Reduce context switching and time spent searching for documentation by making institutional knowledge instantly accessible within VS Code, powered by AI that understands both your code and your documentation.**

## Goals

1. **Seamless Authentication:** Integrate with existing enterprise SSO (PingID) without bypassing security
2. **Intelligent Search:** Use AI to understand intent and surface relevant docs based on context
3. **Context Awareness:** Automatically suggest docs relevant to current file/project
4. **Fast Access:** Sub-second response for cached queries, <3 seconds for fresh searches
5. **Trust & Security:** Respect enterprise security policies, minimal permissions, audit trail
6. **Developer Experience:** Native VS Code UI, keyboard shortcuts, minimal disruption to workflow

## Non-Goals

1. **Not a full Drive client:** Won't replicate all Google Drive features (sharing, comments, etc.)
2. **Not a replacement for Drive:** Complements Drive, doesn't replace it
3. **Not bidirectional sync:** Initial version is read-only (write features in future iterations)
4. **Not multi-tenant:** Designed for single organization's Google Workspace
5. **Not offline-first:** Requires network connection (caching improves experience)

## Key Features

### 1. Quick Search
- Command palette integration (`Cmd+Shift+K`)
- Fuzzy search across file names and content
- AI-powered relevance ranking
- Preview snippets showing match context

### 2. Context-Aware Suggestions
- Automatic detection based on file path and content
- Non-intrusive notifications
- Learns from user preferences

### 3. AI-Powered Q&A
- Natural language questions (`Cmd+Shift+?`)
- Answers with source citations
- Conversation history within session

### 4. Sidebar TreeView
- Recent documents
- Favorites
- Quick access to common folders
- Category organization

### 5. Document Viewer
- View Google Docs in VS Code
- Markdown conversion
- Syntax highlighting for code blocks
- Inline images

## Architecture Principles

1. **Security First:** Minimal permissions, secure token storage, audit logging
2. **Performance:** Aggressive caching, lazy loading, background indexing
3. **User Experience:** Native VS Code patterns, keyboard-driven, non-intrusive
4. **Privacy:** Local-only storage, no telemetry to third parties
5. **Reliability:** Graceful degradation, offline support via cache

## Success Metrics

### Adoption
- Month 1: 25% of team using extension
- Month 3: 60% of team using extension
- Month 6: 80% of team using extension

### Usage
- 50+ searches per day (team-wide)
- 15-20 minutes saved per user per day
- 50% reduction in Drive tab opens

### Satisfaction
- NPS Score >40
- User rating >4.5/5 stars
- 70%+ monthly retention

## User Personas

### Sarah - New Platform Engineer
- **Need:** Quick access to documentation while onboarding
- **Pain:** Doesn't know what docs exist or where to find them
- **Solution:** Context-aware suggestions show relevant docs automatically

### Mike - On-Call Engineer
- **Need:** Fast access to runbooks during incidents
- **Pain:** Wasting time searching Drive during outages
- **Solution:** Quick search (`Cmd+Shift+K`) finds runbooks instantly

### Alex - Senior Engineer
- **Need:** Verify code follows standards during reviews
- **Pain:** Context switching to check guidelines
- **Solution:** AI Q&A answers questions with citations to standards

## Related Documents

- [Authentication Strategy](authentication.md)
- [Features Specification](features.md)
- [Security & Compliance](security.md)
- [Component Overview](../architecture/component-overview.md)

## Open Questions

See [Overall Roadmap](../tasks/overall-roadmap.md#open-questions) for current open questions and decisions needed.

---

**Next Steps:** Review [Project Setup](../implementation/project-setup.md) to begin development.
