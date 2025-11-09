# Phase 2: AI Features (Weeks 4-5)

**Goal:** Add intelligent, AI-powered features using VS Code Language Model API

**Duration:** 2 weeks
**Status:** Not Started
**Prerequisites:** Phase 1 complete

---

## Week 4: Copilot Integration & Q&A

### CopilotService Implementation

- [ ] **Task 4.1:** Create CopilotService wrapper
  - File: `src/services/copilot.ts`
  - Methods:
    - `getModel()`: Get Copilot model
    - `askWithContext(question, docs)`: AI Q&A
    - `getSemanticSimilarity(query, doc)`: Similarity scoring
    - `extractKeywords(text)`: Keyword extraction
  - **Estimated Time:** 4 hours
  - **Reference:** Lines 671-765 in design doc

- [ ] **Task 4.2:** Implement model selection
  - Prefer GPT-4o if available
  - Fallback to other models
  - Error handling for no Copilot
  - **Estimated Time:** 2 hours

- [ ] **Task 4.3:** Add streaming response handling
  - Handle async iterator
  - Accumulate response fragments
  - Show progress to user
  - **Estimated Time:** 3 hours

### AI Q&A Feature

- [ ] **Task 4.4:** Create Ask Question command
  - File: `src/commands/ask.ts`
  - Register command: `teambrain.askQuestion`
  - Show input box for question
  - **Estimated Time:** 2 hours

- [ ] **Task 4.5:** Implement context building
  - Search for relevant docs
  - Limit context size (token budget)
  - Format for Copilot
  - **Estimated Time:** 3 hours

- [ ] **Task 4.6:** Create answer display panel
  - File: `src/ui/answerPanel.ts`
  - Webview for formatted answer
  - Markdown rendering
  - Clickable source citations
  - **Estimated Time:** 5 hours

- [ ] **Task 4.7:** Add citation extraction
  - Parse AI response for document references
  - Create clickable links
  - Highlight relevant sections
  - **Estimated Time:** 3 hours

- [ ] **Task 4.8:** Implement conversation history
  - Store within session
  - Allow follow-up questions
  - Context from previous messages
  - **Estimated Time:** 3 hours

### Semantic Search

- [ ] **Task 4.9:** Implement semantic similarity scoring
  - Use `getSemanticSimilarity()`
  - Only for top keyword results (performance)
  - Integrate into ranking algorithm
  - **Estimated Time:** 4 hours

- [ ] **Task 4.10:** Update search ranking algorithm
  - File: `src/commands/search.ts`
  - Combine: keywords + recency + access + AI similarity
  - Configurable weights
  - **Estimated Time:** 3 hours

- [ ] **Task 4.11:** Add relevance scoring to UI
  - Show relevance percentage
  - Sort by relevance
  - **Estimated Time:** 2 hours

### Testing

- [ ] **Task 4.12:** Write CopilotService tests
  - File: `test/suite/copilot.test.ts`
  - Mock VS Code LM API
  - Test question answering
  - Test semantic similarity
  - **Estimated Time:** 3 hours

- [ ] **Task 4.13:** Test Ask Question flow
  - Integration test
  - Verify answer appears
  - Verify citations work
  - **Estimated Time:** 2 hours

**Week 4 Total:** ~39 hours

---

## Week 5: Context Awareness

### Context Detection

- [ ] **Task 5.1:** Implement file path analysis
  - File: `src/utils/contextDetector.ts`
  - Pattern matching for common paths
  - Examples:
    - `/services/auth/*` → authentication
    - `*migration*.sql` → database migration
    - `*.tf` → terraform/infrastructure
  - **Estimated Time:** 3 hours

- [ ] **Task 5.2:** Implement file content analysis
  - Keyword extraction from file
  - Import statement analysis
  - Framework detection
  - **Estimated Time:** 4 hours

- [ ] **Task 5.3:** Integrate Copilot for topic extraction
  - Send file snippet to Copilot
  - Ask for relevant keywords
  - Parse response
  - **Estimated Time:** 3 hours

- [ ] **Task 5.4:** Create context detection pipeline
  - Combine path + content + AI analysis
  - Deduplicate keywords
  - Cache results per file
  - **Estimated Time:** 3 hours

### Automatic Suggestion System

- [ ] **Task 5.5:** Implement file watch handler
  - Hook: `onDidChangeActiveTextEditor`
  - Debounce to avoid excessive calls
  - Detect context for new file
  - **Estimated Time:** 2 hours

- [ ] **Task 5.6:** Create getSuggestedDocs function
  - File: `src/services/suggestions.ts`
  - Search Drive with context keywords
  - Rank by relevance
  - Limit to top 5 results
  - **Estimated Time:** 3 hours

- [ ] **Task 5.7:** Build suggestion notification UI
  - Non-intrusive notification
  - "📚 Found 3 related docs"
  - Click to expand
  - Quick actions: Open, Dismiss, Don't Show Again
  - **Estimated Time:** 4 hours

- [ ] **Task 5.8:** Add user preferences
  - Enable/disable suggestions per workspace
  - Configure suggestion delay
  - Configure max suggestions
  - **Estimated Time:** 2 hours

### Learning & Improvement

- [ ] **Task 5.9:** Track suggestion interactions
  - Which suggestions user clicks
  - Which user dismisses
  - Store in workspace state
  - **Estimated Time:** 2 hours

- [ ] **Task 5.10:** Implement preference learning
  - Boost docs user frequently opens
  - Lower priority for dismissed suggestions
  - Adjust context weights
  - **Estimated Time:** 3 hours

### Testing

- [ ] **Task 5.11:** Test context detection
  - File: `test/suite/contextDetector.test.ts`
  - Test path patterns
  - Test content analysis
  - Test keyword extraction
  - **Estimated Time:** 3 hours

- [ ] **Task 5.12:** Test suggestion system
  - File: `test/suite/suggestions.test.ts`
  - Mock file changes
  - Verify suggestions appear
  - Test user interactions
  - **Estimated Time:** 3 hours

- [ ] **Task 5.13:** Integration testing
  - End-to-end suggestion flow
  - Test with real files
  - Verify AI integration
  - **Estimated Time:** 2 hours

### Documentation

- [ ] **Task 5.14:** Update README with AI features
  - Document Ask Question command
  - Document context suggestions
  - Add examples
  - **Estimated Time:** 2 hours

- [ ] **Task 5.15:** Create AI features guide
  - How to use Q&A
  - How suggestions work
  - Copilot requirements
  - **Estimated Time:** 2 hours

**Week 5 Total:** ~41 hours

---

## Phase 2 Deliverables

### Functional Requirements

✅ AI-powered Q&A with citations
✅ Context-aware document suggestions
✅ Semantic search ranking
✅ Improved search relevance
✅ User preference learning

### Technical Requirements

✅ CopilotService implemented
✅ VS Code LM API integrated
✅ Context detection working
✅ Suggestion system functional
✅ Tests for AI features passing

### Success Criteria

- [ ] Users can ask questions and get answers
- [ ] Answers include clickable citations
- [ ] Suggestions appear automatically
- [ ] Suggestions are relevant to current file
- [ ] Semantic search improves results
- [ ] Test coverage >70%

---

## Testing Checklist

### Manual Testing

- [ ] Run Ask Question command
- [ ] Enter question: "How do we deploy to production?"
- [ ] Verify answer appears with sources
- [ ] Click on citation link
- [ ] Verify correct doc opens
- [ ] Open file in project (e.g., auth service)
- [ ] Wait for suggestion notification
- [ ] Verify suggestions are relevant
- [ ] Click suggestion to open doc
- [ ] Dismiss suggestion
- [ ] Verify doesn't appear again
- [ ] Test with Copilot disabled
- [ ] Verify graceful degradation

### Automated Testing

- [ ] All AI feature tests pass
- [ ] Context detection tests pass
- [ ] Integration tests pass
- [ ] No regressions in Phase 1 features

---

## Performance Considerations

### Copilot API Usage

- **Rate Limits:** Monitor API usage
- **Token Budget:** Limit context size per request
- **Caching:** Cache AI responses for repeated questions
- **Fallback:** Graceful degradation if Copilot unavailable

### Context Detection

- **Debouncing:** Don't analyze on every keystroke
- **Caching:** Cache context per file
- **Lazy Loading:** Only analyze when file opened

---

## Fallback Strategy

If Copilot API is unavailable:

1. **Q&A:** Show message: "Copilot required for Q&A"
2. **Semantic Search:** Fall back to keyword search
3. **Context Detection:** Use path and keyword analysis only
4. **Suggestions:** Continue with non-AI context detection

---

## Known Issues / Technical Debt

- [ ] Issue: ___
- [ ] Technical Debt: ___

---

## Next Phase

After Phase 2 completion, proceed to:
- [Phase 3: Optimization](phase-3-optimization.md)

---

**Phase 2 Status:** Not Started
**Last Updated:** 2025-11-09
