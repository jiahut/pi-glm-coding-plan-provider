# pi-glm-coding-plan-provider

GLM Coding Plan provider extension for [pi](https://github.com/mariozechner/pi).

Provides access to GLM Coding Plan models via Zhipu AI's OpenAI-compatible Coding API endpoint. Models are fetched from [models.dev](https://models.dev) on startup with a hardcoded fallback list.

## Install

From a public Git repository:

```bash
pi install https://github.com/lulucatdev/pi-glm-coding-plan-provider
```

Or, after publishing to npm:

```bash
pi install pi-glm-coding-plan-provider
```

You can also add it to your pi config:

```json
{
  "packages": ["pi-glm-coding-plan-provider"]
}
```

## Authentication

Use `/login` in pi and select **GLM Coding Plan** to paste your API key.

Alternatively, set the `GLM_CODING_PLAN_API_KEY` environment variable.

## Custom Base URL

By default, the provider uses Zhipu AI's dedicated Coding Plan endpoint:

```text
https://open.bigmodel.cn/api/coding/paas/v4
```

To override it before starting pi, set:

```bash
export GLM_CODING_PLAN_BASE_URL="https://open.bigmodel.cn/api/coding/paas/v4"
```

## Notes

- This implementation follows the same OpenAI-compatible Coding Plan pattern documented for OpenCode.
- The provider uses the `zhipuai-coding-plan` catalog from `models.dev`.

## License

MIT
