# omp-customizations

My [oh-my-pi](https://github.com/can1357/oh-my-pi) (`omp`) customizations.

## Extensions

### `context-tokens`

Shows how many tokens are in the context window as `24.6k/272k`. omp's built-in `context_pct` segment shows a percentage and the window size, but not the used count.

The denominator is `compaction.thresholdTokens` when that is set (positive) and below the model's window, so it's the point where omp compacts. Otherwise it's the model's window. It does not account for `compaction.thresholdPercent` or the default reserve-based threshold, so with those it shows the window.

It sets a status with `ctx.ui.setStatus("context-tokens", ...)` after anything that changes the context: session start, switch, branch, tree navigation, compaction, and every turn end. Right after a compaction omp doesn't know the used count yet, so it shows `?/200k` until the next turn.

omp only renders extension statuses where the `status` segment is in the status line, and `status` is only honoured with `statusLine.preset: custom`. I put it right after `context_pct` so the two sit together. In `~/.omp/agent/config.yml`:

```yaml
statusLine:
  preset: custom
  leftSegments:
    # ...
    - context_pct
    - status
    - cost
  showHookStatus: false
```

`showHookStatus: false` is needed too. Without it omp also prints extension statuses on a footer line under the status line, so the value shows twice.

## Install

omp discovers extension directories with an `omp.extensions` manifest under `~/.omp/agent/extensions/`, so link this repo there:

```sh
mkdir -p ~/.omp/agent/extensions
ln -s "$PWD" ~/.omp/agent/extensions/omp-customizations
```

Or try it for one run without installing: `omp -e ./src/context-tokens.ts`.

## Test

```sh
bun test
```

This covers the number formatting only. The extension itself was checked by running `omp --mode rpc -e ./src/context-tokens.ts` and looking for the `setStatus` request with `statusKey: "context-tokens"`.
