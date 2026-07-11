# Artifacts

An Artifact is a structured deliverable created by the agent to accomplish its task and communicate its progress and thinking to the human user. Artifacts include rich markdown plans (Implementation Plans), code diffs, architecture diagrams, images, and browser recordings.

As agents become more autonomous and execute complex tasks over longer periods, Artifacts enable asynchronous collaboration. You do not need to carefully monitor every individual tool call or step synchronously; instead, you review high-level deliverables at key milestones.

## Reviewing Artifacts Across Surfaces
Artifacts are primarily generated during the agent's Planning Mode and are accessible across both Antigravity 2.0 and the Antigravity CLI.

### Antigravity 2.0
The desktop app features a visual sidebar and review pane specifically optimized for displaying, organizing, and managing rich Artifacts.
- **Capabilities**: You can inspect interactive plans, review visual code diffs, and play back browser recordings of the agent's UI actions directly within the app interface.

### Antigravity CLI
In the lightweight terminal interface, Artifacts are managed using a fast, keyboard-driven review panel.
- **Workflow**: When the agent generates or modifies files that require your approval, a notification appears in your terminal status bar.

## Interactive Steering and Feedback
Feedback is a core mechanism of the Artifact workflow. Depending on your configuration, the agent will pause at intermediate milestones and request review on its plans or code edits before executing them.

- **Steering the Agent**: If an artifact (like an Implementation Plan) does not align with your goal, you can provide inline text feedback to steer the agent's thinking in the proper direction before it modifies any local files.
- **Granular Control**: This approval loop ensures that you remain in the driver's seat, allowing the agent to operate with high autonomy while maintaining strict human-in-the-loop validation.

## Implementation Plan
Agent utilizes the implementation plan artifact to architect changes within your codebase to accomplish a task. These plans contain technical details on what revisions are necessary and are meant to be reviewed by the user.

Unless you have your artifact review policy set to "Always Proceed", Agent will typically request your review on the implementation plan before making the changes needed to complete your task. You can click either the in-conversation or artifact header "Proceed" button to instantly continue with Agent's plan.

Oftentimes, Agent will create a plan that is slightly different from what you exactly want. Antigravity supports commenting on these artifacts so you can provide feedback to Agent for any reason, whether it be to decrease scope of changes, use a different tech stack, or correct any Agent discrepancies.
