# Framework

This folder is the canonical entrypoint for the internal UI framework.

Use these atoms:

1. `BaseWidget`
2. `WidgetProvider`
3. `BaseShell`
4. `ShellRuntimeProvider`
5. `ShellSlot`

Application code should compose these atoms into concrete shells and widgets.

Widget pools, app-specific shells, and map integrations should not redefine framework atoms.

## Human reading

Think about it like this:

1. `BaseShell` = panel
2. `BaseWidget` = instrument
3. `ShellRuntimeProvider` = shared signals / wires
4. `ShellSlot` = widget position inside the panel
5. `WidgetProvider` = shell-owned widget context

The application is the orchestrator.
It chooses:

1. which widgets live in which shell
2. which signals are connected
3. which widgets are movable or locked
4. which adapters connect widgets to the map or uploads
