// Outcomes that say nothing about the model: harness timeouts (laptop sleep, throttling), killed runners
// (137 = OOM / SIGKILL, 143 = SIGTERM), gateway rate limits and usage caps (429), subscription quota messages,
// a ChatGPT login that could not be refreshed, and OpenAI answering "model is at capacity". Shared by export-results, classify-results, drop-infra-results.
export const INFRA = /timed out|exited with code (137|143)|\b429\b|usage limit|rate limit|hit your [^\n]{0,20}limit|limit · resets|not supported when using Codex with a ChatGPT account|model_not_found|did not refresh the ChatGPT token|codex-refresh-|model is at capacity/i;
