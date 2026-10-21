---
name: deep-research
description: Runs a multi-step research workflow that breaks a topic into focused questions, investigates them in parallel through web search, official documentation, and code, then synthesizes a cited, structured report. Use when the user asks for deep research, a thorough investigation, a comparison of options, or a sourced report on a technical or market topic.
license: Apache-2.0
compatibility: Requires web search and web fetch tools. Uses a Context7 MCP server and a GitHub MCP server when available.
metadata:
  version: "0.1.1" # x-release-please-version
  owner: razorvision
---

# Deep Research

Conduct thorough, multi-step research and produce a comprehensive report.

## Usage

`/deep-research <topic or question>`

## Process

Based on the topic in the arguments, plan and execute a research workflow.

### 1. Plan Research

Break the topic into 3-5 specific research questions. For each question, identify:
- What sources to search (web, documentation, code, APIs)
- What specific queries to run
- What data points to collect

### 2. Execute Research

Use parallel subagents (an exploration or research type, if your host has one) for independent research threads:

- **Web Search**: Use WebSearch for current information, trends, comparisons
- **Documentation**: Use WebFetch, or a Context7 MCP server if available, for library/framework docs
- **Code Search**: If a GitHub MCP server is available, use its code and repository search for implementation examples
- **Codebase**: Use Grep/Glob for local code analysis if relevant

Run up to 3 research agents in parallel when questions are independent.

### 3. Synthesize Findings

After gathering data, produce a structured report:

```markdown
# Research Report: [Topic]

## Executive Summary
[2-3 sentence overview of key findings]

## Findings

### [Question 1]
[Detailed findings with citations]

### [Question 2]
[Detailed findings with citations]

...

## Recommendations
[Actionable next steps based on findings]

## Sources
- [Source 1](url)
- [Source 2](url)
```

### 4. Quality Checks

- Cross-reference claims across multiple sources
- Flag conflicting information explicitly
- Distinguish between facts, opinions, and speculation
- Note information freshness (dates) where relevant
- Acknowledge gaps in available information

## Guidelines

- Prefer primary sources over secondary
- Include specific data points, numbers, and examples
- Keep the report scannable with clear headers
- Cite all sources with links
- If research scope is too broad, ask the user to narrow it before starting
