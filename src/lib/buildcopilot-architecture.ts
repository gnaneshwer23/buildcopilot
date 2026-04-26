export type BuildCopilotLayer = {
  id: number;
  name: string;
  internalModule: string;
  tagline: string;
  purpose: string[];
  outputs: string[];
};

export type BuildCopilotBuildPhase = {
  id: string;
  name: string;
  goal: string;
  modules: Array<{ module: string; items: string[] }>;
  notes?: string[];
};

export type BuildCopilotTeamRole = {
  role: string;
  responsibility: string;
};

export type BuildCopilotMetricTarget = {
  metric: string;
  target: string;
};

export type BuildCopilotRiskItem = {
  title: string;
  mitigation: string;
};

export const BUILDCOPILOT_LAYERS: BuildCopilotLayer[] = [
  {
    id: 1,
    name: "BuildCopilot Capture",
    internalModule: "idea_engine",
    tagline: "Where ideas are born",
    purpose: ["Brainstorming", "Idea refinement", "Problem definition"],
    outputs: ["Problem statement", "Personas", "Goals"],
  },
  {
    id: 2,
    name: "BuildCopilot Strategy",
    internalModule: "strategy_engine",
    tagline: "Where clarity is created",
    purpose: ["Define USP", "Market positioning", "Product vision"],
    outputs: ["Strategy doc", "Value proposition", "Roadmap draft"],
  },
  {
    id: 3,
    name: "BuildCopilot Draft",
    internalModule: "prd_engine",
    tagline: "Where requirements are structured",
    purpose: ["PRD generation", "BRD generation", "FRD generation"],
    outputs: ["PRD", "Features", "Metrics", "Risks"],
  },
  {
    id: 4,
    name: "BuildCopilot Breakdown",
    internalModule: "backlog_engine",
    tagline: "Where ideas become execution units",
    purpose: ["Epics", "User stories", "Acceptance criteria"],
    outputs: ["Backlog", "Sprint-ready stories"],
  },
  {
    id: 5,
    name: "BuildCopilot Build",
    internalModule: "execution_engine",
    tagline: "Where execution happens",
    purpose: ["Dev tasks", "Code tracking", "Sprint execution"],
    outputs: ["Code", "PRs", "Build status"],
  },
  {
    id: 6,
    name: "BuildCopilot Verify",
    internalModule: "validation_engine",
    tagline: "Core USP: validation and traceability",
    purpose: ["Validation engine", "Traceability", "Testing"],
    outputs: ["Pass/fail", "Coverage", "Gap detection"],
  },
  {
    id: 7,
    name: "BuildCopilot Insight",
    internalModule: "analytics_engine",
    tagline: "Where intelligence is generated",
    purpose: ["Metrics", "Reports", "Dashboards"],
    outputs: ["Progress", "Risk", "ROI"],
  },
];

export const BUILDCOPILOT_SYSTEM_LOOP =
  "Capture -> Strategy -> Draft -> Breakdown -> Build -> Verify -> Insight -> Capture";

export const BUILDCOPILOT_POSITIONING =
  "BuildCopilot is an AI Delivery Intelligence System that connects idea -> strategy -> PRD -> stories -> code -> validation -> insight, with traceability + validation + intelligence as the core USP.";

export const BUILDCOPILOT_BUILD_PHASES: BuildCopilotBuildPhase[] = [
  {
    id: "P1",
    name: "Foundation",
    goal: "Make idea -> PRD -> stories -> basic tracking work.",
    modules: [
      { module: "Capture", items: ["Idea input", "AI structuring"] },
      { module: "Strategy", items: ["Vision", "Roadmap"] },
      { module: "Draft", items: ["PRD generator"] },
      { module: "Breakdown", items: ["Epics", "Stories"] },
      { module: "Basic Insight", items: ["Simple dashboard"] },
    ],
    notes: ["Skip deep validation", "Skip Git integration", "Skip advanced AI"],
  },
  {
    id: "P2",
    name: "Delivery System",
    goal: "Connect product work to engineering execution.",
    modules: [
      { module: "Build", items: ["Sprint tracking", "Task tracking"] },
      { module: "Breakdown", items: ["Acceptance criteria"] },
      { module: "Insight", items: ["Velocity", "Progress"] },
      { module: "Integration", items: ["Jira sync", "Linear sync"] },
    ],
  },
  {
    id: "P3",
    name: "Core USP",
    goal: "Build the traceability and validation differentiation.",
    modules: [
      { module: "Verify", items: ["Traceability engine", "Validation logic"] },
      { module: "Build", items: ["GitHub code linking"] },
      { module: "Insight", items: ["Validation metrics"] },
    ],
  },
  {
    id: "P4",
    name: "AI Intelligence",
    goal: "Make the system actively intelligent.",
    modules: [
      { module: "AI", items: ["Module agents", "Risk prediction", "Auto PRD improvements", "Auto story generation", "AI reporting"] },
    ],
  },
  {
    id: "P5",
    name: "Enterprise Layer",
    goal: "Scale, govern, and commercialize the platform.",
    modules: [
      { module: "Platform", items: ["Multi-team support", "Permissions", "Audit logs", "Cost tracking", "Advanced dashboards"] },
    ],
  },
];

export const BUILDCOPILOT_MINIMUM_TEAM: BuildCopilotTeamRole[] = [
  { role: "You (PM/Product)", responsibility: "Vision + PRD" },
  { role: "Full-stack engineer", responsibility: "Core system" },
  { role: "Frontend engineer", responsibility: "UI" },
  { role: "AI engineer (optional)", responsibility: "Agents" },
];

export const BUILDCOPILOT_MVP_METRICS: BuildCopilotMetricTarget[] = [
  { metric: "PRD creation time", target: "< 5 mins" },
  { metric: "Story generation", target: "< 2 mins" },
  { metric: "User adoption", target: "50+ users" },
  { metric: "Completion rate", target: "> 60%" },
];

export const BUILDCOPILOT_USP_METRICS: BuildCopilotMetricTarget[] = [
  { metric: "Traceability coverage", target: "% linked" },
  { metric: "Validation success rate", target: "% passed" },
  { metric: "Missing links detected", target: "System strength" },
];

export const BUILDCOPILOT_TOP_RISKS: BuildCopilotRiskItem[] = [
  { title: "Overbuilding", mitigation: "Use phase-based delivery" },
  { title: "Too complex UX", mitigation: "Start with a simple Notion-like interface" },
  { title: "Weak differentiation", mitigation: "Keep Verify as the center of gravity" },
];

export const BUILDCOPILOT_FINAL_BUILD_ORDER = [
  "Capture UI",
  "Strategy page",
  "PRD generator",
  "Story generator",
  "Kanban board",
  "Basic dashboard",
  "Traceability table",
  "Validation engine",
];

export const BUILDCOPILOT_MASTER_BUILD_PROMPT = `Build a full-stack AI-powered product delivery platform called "BuildCopilot".
The system should function as an end-to-end delivery intelligence platform that connects idea -> strategy -> requirements -> backlog -> development -> validation -> reporting.
Create the following modules as separate but connected layers:
1. BuildCopilot Capture
- Input: raw ideas
- Output: structured problem statements, personas, goals
- UI: text input + AI suggestions + refinement panel
2. BuildCopilot Strategy
- Input: problem statements
- Output: USP, value proposition, roadmap
- UI: editable strategy document with AI suggestions
3. BuildCopilot Draft
- Input: strategy
- Output: full PRD (problem, users, solution, features, metrics, risks)
- UI: structured document editor
4. BuildCopilot Breakdown
- Input: PRD
- Output: epics, user stories, acceptance criteria
- UI: backlog board (like Jira)
5. BuildCopilot Build
- Input: user stories
- Output: development tasks, code links, sprint tracking
- UI: kanban board + developer panel
6. BuildCopilot Verify
- Input: code + acceptance criteria
- Output: validation results (pass/fail), coverage, gaps
- UI: traceability table showing:
  requirement -> story -> code -> test -> status
7. BuildCopilot Insight
- Input: all system data
- Output: dashboards with:
  - delivery metrics
  - validation metrics
  - product metrics
  - risk indicators
- UI: executive dashboard
Core features:
- Auto-link all layers (traceability)
- Show missing links as alerts
- Generate daily/weekly reports automatically
- Maintain a real-time system loop
Design style:
- Clean, minimal UI like Linear / Notion
- Dark mode default
- Left sidebar navigation with modules
- Main panel = workspace
- Right panel = insights / AI suggestions
Execution plan and operating gates:
1. Capture raw idea or business problem and run AI brainstorming.
2. Convert that input into problem statement, users, goals, and USP.
3. Produce product strategy, roadmap, and prioritisation.
4. Generate PRD / BRD / FRD artifacts.
5. Break requirements into epics, user stories, and acceptance criteria.
6. Sync backlog items to Jira, Linear, or an internal backlog.
7. Track build execution through developer tasks, IDE work, GitHub, and code status.
8. Verify the build against requirements using tests, traceability, and validation checks.
9. If validation fails, create bug or change request and route it back to the backlog.
10. If validation passes, update documentation and Mermaid workflow / architecture diagrams.
11. Feed outputs into BuildCopilot Insight for dashboards, metrics, and daily / weekly / monthly / quarterly reporting.
12. Run stakeholder review, release / deployment, monitoring, and product feedback loops.
13. Route stakeholder feedback or new risks / opportunities back into Capture so the system operates as a continuous intelligence loop.
Supporting layers that must stay visible throughout execution:
- AI agent layer: Capture, Strategy, PRD, BA, Delivery, Validation, Reporting agents.
- Project manager layer: timeline, budget, risks, dependencies, resources, delivery status.
- Product manager layer: vision, roadmap, prioritisation, success metrics, release strategy.
- Business analyst layer: business requirements, functional requirements, non-functional requirements, user stories, traceability matrix.
- Technical delivery layer: architecture, APIs, database, security, code, testing.
Traceability chain that must remain intact:
requirement -> epic -> story -> acceptance criteria -> task -> code commit -> test case -> validation result
Goal:
Create a system where every idea can be tracked, built, validated, and reported automatically.`;

export const BUILDCOPILOT_ADVANCED_AGENT_PROMPT = `Add AI agents for each module:
- Capture Agent: refines ideas
- Strategy Agent: creates positioning
- Draft Agent: writes PRD
- Breakdown Agent: creates stories
- Build Agent: tracks dev progress
- Verify Agent: validates against acceptance criteria
- Insight Agent: generates reports and predictions
Each agent should:
- suggest improvements
- highlight risks
- automate repetitive tasks`;

export const BUILDCOPILOT_WORKFLOW_MERMAID = `flowchart TD
  A[Raw Idea / Business Problem] --> B[BuildCopilot Capture<br/>AI Brainstorming Engine]
  B --> C[Problem, Users, Goals, USP]
  C --> D[BuildCopilot Strategy<br/>Product Vision, Roadmap, Prioritisation]
  D --> E[BuildCopilot Draft<br/>PRD / BRD / FRD]
  E --> F[BuildCopilot Breakdown<br/>Epics, User Stories, Acceptance Criteria]
  F --> G[Backlog Sync<br/>Jira / Linear / Internal Backlog]
  G --> H[BuildCopilot Build<br/>IDE / GitHub / Dev Tasks]
  H --> I[Code Built]
  I --> J[BuildCopilot Verify<br/>Tests + Code Validation]
  J --> K{Does build match requirements?}

  K -- Yes --> L[Update Documentation<br/>Confluence / Internal Docs]
  L --> M[Update Mermaid Diagrams<br/>Architecture + Workflow]
  M --> N[BuildCopilot Insight<br/>Dashboards + Metrics]
  N --> O[Daily / Weekly / Monthly / Quarterly Reports]
  O --> P[Stakeholder Review]
  P --> Q{Feedback or Change Request?}

  Q -- Yes --> B
  Q -- No --> R[Release / Deployment]
  R --> S[User Feedback + Product Metrics]
  S --> T{New Risk, Problem, or Opportunity?}

  T -- Yes --> B
  T -- No --> U[Continuous Monitoring]
  U --> S

  K -- No --> V[Gap Detected]
  V --> W[Create Bug / Change Request]
  W --> G

  subgraph AI[AI Agent Layer]
    AI1[Capture Agent]
    AI2[Strategy Agent]
    AI3[PRD Agent]
    AI4[BA Agent]
    AI5[Delivery Agent]
    AI6[Validation Agent]
    AI7[Reporting Agent]
  end

  B --> AI1
  D --> AI2
  E --> AI3
  F --> AI4
  G --> AI5
  J --> AI6
  N --> AI7

  subgraph PM[Project Manager Layer]
    PM1[Timeline]
    PM2[Budget]
    PM3[Risks]
    PM4[Dependencies]
    PM5[Resources]
    PM6[Delivery Status]
  end

  subgraph PROD[Product Manager Layer]
    PR1[Vision]
    PR2[Roadmap]
    PR3[Prioritisation]
    PR4[Success Metrics]
    PR5[Release Strategy]
  end

  subgraph BA[Business Analyst Layer]
    BA1[Business Requirements]
    BA2[Functional Requirements]
    BA3[Non-Functional Requirements]
    BA4[User Stories]
    BA5[Traceability Matrix]
  end

  subgraph TECH[Technical Delivery Layer]
    T1[Architecture]
    T2[APIs]
    T3[Database]
    T4[Security]
    T5[Code]
    T6[Testing]
  end

  D --> PROD
  E --> BA
  F --> BA
  G --> PM
  H --> TECH
  J --> TECH
  N --> PM
  N --> PROD
  N --> BA
  N --> TECH

  subgraph TRACE[Traceability Engine]
    TR1[Requirement]
    TR2[Epic]
    TR3[Story]
    TR4[Acceptance Criteria]
    TR5[Task]
    TR6[Code Commit]
    TR7[Test Case]
    TR8[Validation Result]
  end

  E --> TR1
  TR1 --> TR2
  TR2 --> TR3
  TR3 --> TR4
  TR4 --> TR5
  TR5 --> TR6
  TR6 --> TR7
  TR7 --> TR8
  TR8 --> J

  subgraph LOOP[Continuous Intelligence Loop]
    L1[Plan]
    L2[Build]
    L3[Validate]
    L4[Document]
    L5[Report]
    L6[Learn]
    L7[Improve]
  end

  B --> L1
  G --> L2
  J --> L3
  L --> L4
  N --> L5
  S --> L6
  L6 --> L7
  L7 --> B`;
