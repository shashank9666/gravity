# Agent Skills

Skills are an open standard for extending agent capabilities. A skill is a folder containing a SKILL.md file with instructions that the agent can follow when working on specific tasks.

## What are skills?
Skills are reusable packages of knowledge that extend what the agent can do. Each skill contains:
- Instructions for how to approach a specific type of task
- Best practices and conventions to follow
- Optional scripts and resources the agent can use

When you start a conversation, the agent sees a list of available skills with their names and descriptions. If a skill looks relevant to your task, the agent reads the full instructions and follows them.

## Where skills live
Antigravity supports two types of skills:
- **Workspace-specific**: `<workspace-root>/.agents/skills/<skill-folder>/`
- **Global (all workspaces)**: `~/.gemini/config/skills/<skill-folder>/`

Workspace skills are great for project-specific workflows, like your team's deployment process or testing conventions. Global skills work across all your projects. Use these for personal utilities or general-purpose tools you want everywhere.

## Creating a skill
To create a skill:
1. Create a folder for your skill in one of the skill directories
2. Add a SKILL.md file inside that folder

Every skill needs a SKILL.md file with YAML frontmatter at the top:
```yaml
---
name: my-skill
description: Helps with a specific task. Use when you need to do X or Y.
---

# My Skill
Detailed instructions for the agent go here.
```

## Frontmatter fields
- `name` (Optional): A unique identifier for the skill (lowercase, hyphens for spaces). Defaults to the folder name if not provided.
- `description` (Required): A clear description of what the skill does and when to use it. This is what the agent sees when deciding whether to apply the skill.

## Skill folder structure
While SKILL.md is the only required file, you can include additional resources:
- `scripts/`: Helper scripts (optional)
- `examples/`: Reference implementations (optional)
- `resources/`: Templates and other assets (optional)

## How the agent uses skills
Skills follow a progressive disclosure pattern:
1. **Discovery**: When a conversation starts, the agent sees a list of available skills with their names and descriptions
2. **Activation**: If a skill looks relevant to your task, the agent reads the full SKILL.md content
3. **Execution**: The agent follows the skill's instructions while working on your task

## Best practices
- **Keep skills focused**: Each skill should do one thing well.
- **Write clear descriptions**: Make it specific about what the skill does and when it's useful.
- **Use scripts as black boxes**: Encourage the agent to run them with --help first rather than reading the entire source code.
- **Include decision trees**: For complex skills, add a section that helps the agent choose the right approach based on the situation.
