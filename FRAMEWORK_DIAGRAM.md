# Framework Diagram

## 1. Full System

```mermaid
flowchart TD
  APP["Application Orchestrator"]

  subgraph FW["Framework"]
    BS["BaseShell"]
    BW["BaseWidget"]
    RT["ShellRuntime"]
    SL["ShellSlot"]
    WC["WidgetContext"]
  end

  subgraph SHELLS["Concrete Shells"]
    LS["Left Shell"]
    RS["Right Entity Shell"]
    WS["Widget Center Shell"]
    LIB["Widget Library Shell"]
    TC["Top Chrome Shell"]
  end

  subgraph WIDGETS["Widget Pool"]
    SW["Shell Widgets"]
    EW["Entity Widgets"]
    GW["Global Widgets"]
  end

  MAP["Map Adapter"]
  DB["Database"]

  APP --> LS
  APP --> RS
  APP --> WS
  APP --> LIB
  APP --> TC
  APP --> SW
  APP --> EW
  APP --> GW
  APP --> MAP
  APP --> DB

  LS --> BS
  RS --> BS
  WS --> BS
  LIB --> BS
  TC --> BS

  LS --> RT
  RS --> RT
  WS --> RT
  LIB --> RT
  TC --> RT

  LS --> SL
  RS --> SL
  WS --> SL
  LIB --> SL
  TC --> SL

  LS --> WC
  RS --> WC
  WS --> WC
  LIB --> WC
  TC --> WC

  SW --> BW
  EW --> BW
  GW --> BW

  EW --> MAP
  SW --> MAP

  DB --> RT
  DB --> WIDGETS
  DB --> SHELLS
```

## 2. Mental Model

```mermaid
flowchart LR
  SH["Shell = panel / rack"] --> SG["Signals = wires"]
  WD["Widget = instrument"] --> SG
  SG --> MP["Map Adapter = external device"]
  APP["App = orchestrator"] --> SH
  APP --> WD
  APP --> SG
  APP --> MP
```

## 3. What BaseShell Owns

```mermaid
flowchart TD
  BS["BaseShell"]
  BS --> B1["open / close"]
  BS --> B2["placement"]
  BS --> B3["motion"]
  BS --> B4["backdrop"]
  BS --> B5["scroll region"]
  BS --> B6["header region"]
```

## 4. What BaseWidget Owns

```mermaid
flowchart TD
  BW["BaseWidget"]
  BW --> W1["frame"]
  BW --> W2["header"]
  BW --> W3["settings"]
  BW --> W4["host selector UI"]
  BW --> W5["shell-native behavior"]
```

## 5. Runtime Inside One Shell

```mermaid
flowchart TD
  S["One Shell Instance"] --> R["ShellRuntime"]
  R --> WA["Widget A"]
  R --> WB["Widget B"]
  R --> WC["Widget C"]
  R --> SC["shell capabilities"]
```

## 6. Signal Example

```mermaid
flowchart LR
  MW["Mode Switch Widget"] -- "selected_mode" --> RT["ShellRuntime"]
  RT -- "mode" --> CW["Collections Widget"]
  RT -- "mode" --> MAP["Map Adapter"]
  SH["Shell"] -- "disabled" --> MW
  SH -- "disabled" --> CW
```

## 7. Real Product Example

```mermaid
sequenceDiagram
  participant U as User
  participant M as Mode Widget
  participant R as Shell Runtime
  participant C as Collections Widget
  participant MAP as Map Adapter

  U->>M: Click "Paths"
  M->>R: selected_mode = "paths"
  R->>C: mode = "paths"
  C->>MAP: filter / focus request
  MAP-->>C: visible entities
```

## 8. Backend Model

```mermaid
flowchart TD
  WD["widget_definitions"] --> WI["widget_instances"]
  SD["shell_definitions"] --> SI["shell_instances"]
  WI --> WP["widget_placements"]
  SI --> WP

  SG["signal_definitions"] --> SB["shell_signal_bindings"]
  PT["widget_ports"] --> SB

  WI --> CN["widget_connections"]
  PT --> CN
  SG --> CN
```

## 9. Folder Rule

```mermaid
flowchart LR
  FR["src/framework"] --> A["BaseShell / BaseWidget / Runtime / Slot / Context"]
  CW["src/components/widgets"] --> B["Concrete product widgets"]
  CS["src/components/shells"] --> C["Concrete product shells"]
  APP["src/app"] --> D["Orchestration"]
```
