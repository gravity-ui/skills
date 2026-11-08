# Results

pass@k over the latest run of every experiment (`runs` per eval, all counted — no early exit). Runs that hit the
harness timeout or whose runner was killed (OOM) are excluded from the rate and shown as `+n t/o`. Cost is an
API-equivalent estimate from the tokens the CLI reported and `pricing.json`; n/a when a model has no price.

## claude-subscription--claude-code

| Model | Baseline | + gravity-ui skill | Δ | Mean eval time (base → skill) | Est. cost (base → skill) |
| --- | --- | --- | --- | --- | --- |
| claude-fable-5-1 | 68% (46/68) | 96% (65/68) | 28 pp | 928s → 779s | n/a → n/a |
| claude-opus-5-5 | 72% (49/68) | 94% (64/68) | 22 pp | 677s → 677s | n/a → n/a |
| claude-sonnet-5-5 | 65% (44/68) | 99% (67/68) | 34 pp | 508s → 562s | n/a → n/a |

## codex-subscription--codex

| Model | Baseline | + gravity-ui skill | Δ | Mean eval time (base → skill) | Est. cost (base → skill) |
| --- | --- | --- | --- | --- | --- |
| gpt-6-astra | 28% (19/68) | 91% (62/68) | 63 pp | 1306s → 723s | n/a → n/a |
| gpt-6-luna | 15% (10/68) | 85% (58/68) | 70 pp | 973s → 646s | n/a → n/a |
| gpt-6.1-sol | 25% (17/68) | 85% (58/68) | 60 pp | 1228s → 793s | n/a → n/a |

## opencode-go--claude-code

| Model | Baseline | + gravity-ui skill | Δ | Mean eval time (base → skill) | Est. cost (base → skill) |
| --- | --- | --- | --- | --- | --- |
| claude-haiku-5-5 | 66% (45/68) | 88% (60/68) | 22 pp | 543s → 390s | $3.43 → $2.54 |
| kimi-k3 | 50% (34/68) | 79% (54/68) | 29 pp | 546s → 498s | $46.51 → $58.37 |

## opencode-go--codex

| Model | Baseline | + gravity-ui skill | Δ | Mean eval time (base → skill) | Est. cost (base → skill) |
| --- | --- | --- | --- | --- | --- |
| deepseek-v4-pro | 56% (38/68) | 88% (60/68) | 32 pp | 468s → 542s | $6.16 → $17.22 |
| glm-5.3-flash | 48% (32/67) +1 t/o | 85% (58/68) | 37 pp | 428s → 486s | $4.10 → $10.09 |
