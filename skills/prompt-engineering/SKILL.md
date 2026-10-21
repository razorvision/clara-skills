---
name: prompt-engineering
description: Audits and optimizes AI prompts, system instructions, few-shot examples, and tool definitions for clarity, specificity, and token efficiency, then presents the improved prompt with the reasoning behind each change. Use when designing or refining a system prompt, when model responses are off-target, verbose, or inconsistent, or when a tool is not being called correctly.
license: Apache-2.0
metadata:
  version: "0.1.1" # x-release-please-version
  owner: razorvision
---

# Prompt Engineering

Systematic approach to designing and optimizing prompts for AI models (Claude, OpenAI, and others).

## Usage

Invoke with the prompt to optimize, a file path, or a description of the AI feature. With no argument, the skill looks for system prompts in the codebase.

## When to Use

- Designing or refining a system prompt for an AI-powered feature
- AI responses are off-target, verbose, or inconsistent
- Creating tool definitions for function calling
- Building few-shot examples for a specific task
- Optimizing token usage while maintaining quality

## Process

Analyze the target prompt the user named. If no specific prompt is given, look for system prompts in the codebase (e.g., `system-prompt.ts`, `systemPrompt`, `prompts/`).

### 1. Audit Current Prompt

Read the existing prompt and evaluate against these criteria:

| Criteria | Check |
|----------|-------|
| **Clarity** | Is the role/task unambiguous? |
| **Specificity** | Are output format and constraints explicit? |
| **Examples** | Are few-shot examples provided for complex tasks? |
| **Negative constraints** | Does it say what NOT to do? |
| **Token efficiency** | Any redundant or verbose instructions? |
| **Ordering** | Most important instructions at top and bottom (primacy/recency)? |
| **Tool descriptions** | Are tool parameters and purposes clear to the model? |

### 2. Apply Anthropic Best Practices

- **Role assignment**: Start with a clear role definition
- **XML tags**: Use tags to structure sections (context, instructions, examples, output format)
- **Chain of thought**: For complex reasoning, instruct the model to think step by step, or use the model's built-in extended thinking where available
- **Prefill**: Use assistant prefill to steer output format, on models and APIs that support it
- **Be direct**: State requirements plainly, avoid hedging language
- **Examples over descriptions**: Show the model what you want, don't just describe it
- **Separate data from instructions**: Put user-provided data in clearly marked sections

### 3. Optimize Tool Definitions

For function-calling / tool-use patterns:
- The tool `description` is the most important field: it determines when the model picks the tool
- Parameter descriptions should include valid values, formats, and constraints
- Include `enum` values where possible to constrain choices
- Add examples in descriptions: `"The user's email address (e.g., user@example.com)"`

### 4. Test and Iterate

- Identify 3-5 representative test inputs covering edge cases
- Run the prompt against each test input
- Compare outputs to expected behavior
- Adjust and re-test

## Common Fixes

| Problem | Fix |
|---------|-----|
| Too verbose | Add "Be concise. Max N sentences." |
| Hallucinating facts | Add "Only use information from the provided context. Say 'I don't know' if unsure." |
| Wrong format | Add an explicit example of the expected output |
| Ignoring instructions | Move critical instructions to the end (recency bias) |
| Inconsistent tone | Add 2-3 few-shot examples demonstrating desired tone |
| Tool not being called | Improve the tool description, add "Use the X tool when..." to the system prompt |
| Wrong tool chosen | Make tool descriptions more distinct, add negative examples |

## Output

Present the optimized prompt with a brief explanation of changes made and why.
