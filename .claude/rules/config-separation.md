# Keep project-specific configuration separate from general logic

Anything likely to be specific to this particular deployment or account setup — Notion database IDs, account names/colors, the allowed login email, API keys, select-option literals, etc. — belongs in environment variables or a dedicated config/constants file. Never hardcode these inline in application logic.

This keeps the codebase reusable instead of tied to one specific setup.
