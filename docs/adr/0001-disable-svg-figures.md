# Turn off SVG figures (`tui.renderSvg: false`)

`tui.renderSvg` costs ~155 tokens on every request (OpenAI `o200k_base`), about 5% of the system prompt. SVG figures aren't worth that to me.

I use omp in Alacritty inside tmux, and Alacritty can't render SVG. With `tui.renderSvg` on (the default), the system prompt still asks the model to draw SVG, so those replies show up as raw XML.

## Status

Accepted, 2026-11-13, on omp 18.20.0.

## Considered options

- **Force an image protocol** with `PI_FORCE_IMAGE_PROTOCOL=kitty|sixel`. Rejected: Alacritty can't render images, so this doesn't help.
- **Switch to a terminal with image support** (Kitty, Ghostty, WezTerm, Konsole or foot, plus `set -g allow-passthrough on` in tmux). Rejected: I want to keep Alacritty.
- **Wait for an upstream fix.** Rejected: [#18428](https://github.com/can1357/oh-my-pi/issues/18428), "renderSvg prompt not gated on imageProtocol", is open but labelled `wontfix`.

## Consequences

- The model won't offer SVG diagrams on any terminal.
- Mermaid diagrams (`tui.renderMermaid`) and charts under tables (`tui.autoGraph`) are separate settings and still work, because they draw as text.

## Token counts

Tokens removed from the system prompt, by tokenizer:

| Tokenizer | Tokens removed | Full prompt | Share | Used by |
|---|---|---|---|---|
| tiktoken `o200k_base` | 155 | 2,850 | 5.4% | GPT-5, and likely GPT-6.1 Sol ([tiktoken #616](https://github.com/openai/tiktoken/pull/616)) |
| tiktoken `cl100k_base` | 157 | 2,873 | 5.5% | GPT-4 |
| [`@anthropic-ai/tokenizer`](https://github.com/anthropics/anthropic-tokenizer-typescript) 0.0.4 | 161 | 3,151 | 5.1% | Claude 2 |

Claude 4.7 and later use a newer tokenizer that produces about 30% more tokens for the same text ([Anthropic token counting docs](https://platform.claude.com/docs/en/build-with-claude/token-counting)). In those terms the saving is about 200–210 tokens, an estimate scaled from the Claude 2 count.
