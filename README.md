# omp-customizations

My [oh-my-pi](https://github.com/can1357/oh-my-pi) (`omp`) customizations.

## Extensions

### `context-tokens`

Shows how many tokens are in the context window as `24.6k/272k`. omp's built-in `context_pct` segment shows a percentage and the window size, but not the used count.

It also sets the compaction point per model. For a window above 272k tokens (e.g. a 1M model) it overrides `compaction.thresholdTokens` to 272000 for the running session only, nothing is written to `config.yml`. For smaller windows (e.g. 200k) it clears the override so omp's default threshold applies. Change `LARGE_WINDOW_COMPACT_AT` in `src/format.ts` to move the cap.

The denominator is the forced limit when there is one, else the model's window. With omp's default threshold it shows the window, not the real compaction point, because the extension doesn't compute omp's reserve-based default. Keep `compaction.thresholdTokens` and `compaction.thresholdPercent` unset in config, since the extension replaces the former.

It sets a status with `ctx.ui.setStatus("context-tokens", ...)` after anything that changes the context: session start, switch, branch, tree navigation, compaction, and every turn end. Right after a compaction omp doesn't know the used count yet, so it shows `?/200k` until the next turn.

omp only renders extension statuses where the `status` segment is in the status line, and `status` is only honoured with `statusLine.preset: custom`. I use it in place of `context_pct`. In `~/.omp/agent/config.yml`:

```yaml
statusLine:
  preset: custom
  leftSegments:
    # ...
    - pr
    - status
    - cost
  showHookStatus: false
```

`showHookStatus: false` is needed too. Without it omp also prints extension statuses on a footer line under the status line, so the value shows twice.

### `grill-ask-reminder`

When I invoke `/skill:grill-me` or `/skill:grill-with-docs`, adds a message telling the model to ask the grilling questions with the `ask` tool instead of writing them as chat text. Other skills, including `grilling` itself, are unaffected. omp has no bare `/grill-me` command, so only the `/skill:` form is matched (leading, or as a token mid-prompt).

The `input` hook sees the raw text, but the skill is delivered as a custom message that bypasses it, so the hook only sets a flag and `before_agent_start` injects the reminder on that turn. Change `GRILL_SKILLS` and `REMINDER` in `src/grill-ask-reminder.ts` to adjust.

### `code-review-agent-reminder`

When I invoke `/skill:code-review`, adds a message telling the model to spawn the review sub-agents with `agent: "task"` instead of `scout`. The upstream skill doesn't name an agent type, and omp steers read-only work to `scout`, which has no `bash` (`tools: read, find, grep, glob, web_search`). The reviewers then can't run `git diff`, so they can't tell added lines from existing ones. Only the typed `/skill:code-review` form is matched (leading, or as a token mid-prompt); if the model loads the skill itself the reminder doesn't fire.

Same `input` flag + `before_agent_start` injection as `grill-ask-reminder`, deliberately copied rather than shared. Change `REMINDER` in `src/code-review-agent-reminder.ts` to adjust.

## Install

omp discovers extension directories with an `omp.extensions` manifest under `~/.omp/agent/extensions/`, so link this repo there:

```sh
mkdir -p ~/.omp/agent/extensions
ln -s "$PWD" ~/.omp/agent/extensions/omp-customizations
```

Or try one for a single run without installing: `omp -e ./src/context-tokens.ts`.

## Manual setup

### Turn off automated QA reports

By default (`dev.autoqa: true`), omp adds a `<critical>` block to the system prompt that tells the model to write tool problems to `xd://report_issue`. After you agree in a consent popup, those reports are saved to `~/.omp/autoqa.db` and sent to `https://qa.omp.sh/v1/grievances`. Turning it off removes the block from the prompt and stops recording. In `~/.omp/agent/config.yml`:

```yaml
dev:
  autoqa: false
```

Or for one run: `PI_AUTO_QA=0 omp`. Setting `dev.autoqaConsent: denied` is not enough, because an explicit `dev.autoqa: true` overrides it.

### Turn off SVG figures

My terminal (Alacritty in tmux) can't show images, so SVG replies appear as raw XML. Turning this off stops the model from writing them and saves 155 tokens per request (OpenAI `o200k_base` tokenizer). Why, and counts for other tokenizers: [ADR 0001](docs/adr/0001-disable-svg-figures.md). In `~/.omp/agent/config.yml`:

```yaml
tui:
  renderSvg: false
```

## Test

```sh
bun test
```

This covers the number formatting and the skill matchers for the two reminder extensions. `context-tokens` itself was checked by running `omp --mode rpc -e ./src/context-tokens.ts` and looking for the `setStatus` request with `statusKey: "context-tokens"`. `code-review-agent-reminder` was checked the same way: sending `{"type":"prompt","message":"/skill:code-review"}` over `--mode rpc --no-ui` emits a `customType: "code-review-agent-reminder"` message; `/skill:pr` does not. `--mode json -p` doesn't expand `/skill:`, so it can't be used for this.
