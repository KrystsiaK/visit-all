# WidgetContext (WidgetProvider + useWidgetContext)

> AI context file. Read this first when working with WidgetContext.tsx.

## What it is

A React context that passes widget host information down to widgets.
Widgets use this to know which shell they live in and offer a host-change dropdown.

## Exports

- WidgetProvider - context provider component
- useWidgetContext() - returns context value or null
- WidgetHostOption - { value: string; label: string }
- WidgetContextValue - full context shape

## WidgetContextValue shape

- currentHost?: string - current shell host identifier
- hostOptions?: WidgetHostOption[] - available host targets
- hostSelectionDisabled?: boolean - hide host picker
- onHostChange?: (host: string) => void - callback when user changes host

## Usage pattern

WidgetProvider wraps a group of widgets inside a shell.
Individual widgets call useWidgetContext() to read host info.
Returns null when outside a provider (safe to check).

## Dependencies

React only (createContext, useContext).
