
# Phenomate — Frontend ↔ Backend Sequence Diagrams

> The endpoint paths and operation names in these diagrams are taken from the uploaded `urls.txt` export of your BE API.

---

## Table of Contents
- [1) Project listing & bulk actions](#1-project-listing--bulk-actions)
- [2) Create project (lookup reference data → submit)](#2-create-project-lookup-reference-data--submit)
- [3) Project detail + activities tab](#3-project-detail--activities-tab)
- [4) Single activity detail & actions (cancel / retry)](#4-single-activity-detail--actions-cancel--retry)
- [5) Offload data for a project (export job)](#5-offload-data-for-a-project-export-job)
- [6) Home/index (optional helpers)](#6-homeindex-optional-helpers)
- [Appendix: One‑glance map (pages → endpoints)](#appendix-oneglance-map-pages--endpoints)

---

## 1) Project listing & bulk actions
**Pages**: `src/routes/index.tsx`, `src/routes/project.index.tsx`, `src/routes/-project.index.tables.tsx`

<p align="center">
<img src="images/phenomate_project.png" alt="phenomate_project" width="65%">
</p>

```mermaid
sequenceDiagram

  autonumber
  participant FE as FE (Frontend)src/routes/project.index.tsx
  participant Tbl as FE src/routes/-project.index.tables.tsx
  participant API as BE (Backend)(/api/*)
  participant DB as Database

  Note over FE: Project list page mounts
  FE->>API: GET /api/project/  (list_projects)
  API->>DB: SELECT * FROM project
  DB-->>API: rows
  API-->>FE: 200 [{project}, ...]
  FE->>Tbl: render table with rows

  Note over FE: Bulk delete (selected rows)
  FE->>API: DELETE /api/project/  (delete_projects)
  API->>DB: DELETE FROM project WHERE id IN (...)
  DB-->>API: ok
  API-->>FE: 204 No Content
  FE->>API: GET /api/project/  (refresh list)
  API-->>FE: 200 [...]
```

---

## 2) Create project (lookup reference data → submit)
**Page**: `src/routes/project.create.tsx`
<p align="center">
<img src="images/phenomate_project_create.png" alt="phenomate_project_create" width="65%">
</p>
```mermaid
sequenceDiagram
  autonumber
  participant FE as FE src/routes/project.create.tsx
  participant API as BE (/api/*)
  participant DB as Database

  Note over FE: Form loads, fetch reference data
  FE->>API: GET /api/organisation/  (list_organisations)
  API->>DB: SELECT * FROM organisation
  DB-->>API: rows
  API-->>FE: 200 [{id,name}, ...]

  FE->>API: GET /api/researcher/  (list_researchers)
  API->>DB: SELECT * FROM researcher
  DB-->>API: rows
  API-->>FE: 200 [{id,name}, ...]

  Note over FE: User submits the form
  FE->>API: POST /api/project/  (create_project)
  API->>DB: INSERT project (...)
  DB-->>API: new id
  API-->>FE: 201 {project_id, ...}
```

---

## 3) Offload data for a project (export job)
**Pages**: `src/routes/project.$projectId.offload.tsx`, `src/routes/-project.offload.tables.tsx`

<p align="center">
<img src="images/phenomate_project_select_action.png" alt="phenomate_project_select_action" width="65%">
</p>
<p align="center">
<img src="images/phenomate_project_offload_data.png" alt="phenomate_project_offload_data" width="65%">
</p>


```mermaid
sequenceDiagram
  autonumber
  participant FE as FE src/routes/project.$projectId.offload.tsx
  participant Tbl as FE src/routes/-project.offload.tables.tsx
  participant API as BE (/api/*)
  participant Worker as Background worker
  participant FS as Storage
  participant DB as Database

  Note over FE: User triggers offload
  FE->>API: POST /api/activity/offload/<project_id>  (offload_data)
  API->>Worker: start offload job
  Worker->>FS: read/package files
  FS-->>Worker: ok
  Worker->>DB: INSERT activity(status="queued"/"running"/"completed")
  DB-->>Worker: ok
  API-->>FE: 202 {job:"offload", project_id}

  Note over FE: Poll for new/updated activities
  FE->>API: GET /api/activity/<project_id>  (list_activities)
  API->>DB: SELECT * FROM activity WHERE project_id=...
  DB-->>API: rows
  API-->>FE: 200 [{activity}, ...]
  FE->>Tbl: render/offload results
```

---

## 4) Project detail + activities tab
**Pages**: `src/routes/project.$projectId.activities.tsx`, `src/routes/-project.activities.tables.tsx`
<p align="center">
<img src="images/phenomate_project_activities.png" alt="phenomate_project_activities" width="65%">
</p>

```mermaid
sequenceDiagram
  autonumber
  participant FE as FE src/routes/project.$projectId.activities.tsx
  participant Tbl as FE src/routes/-project.activities.tables.tsx
  participant API as BE (/api/*)
  participant DB as Database

  Note over FE: Activities tab mounts
  FE->>API: GET /api/project/id/<project_id>  (get_project)
  API->>DB: SELECT * FROM project WHERE id=...
  DB-->>API: row
  API-->>FE: 200 {project}

  FE->>API: GET /api/activity/<project_id>  (list_activities)
  API->>DB: SELECT * FROM activity WHERE project_id=...
  DB-->>API: rows
  API-->>FE: 200 [{activity}, ...]
  FE->>Tbl: render table

  Note over FE: Delete all activities for project
  FE->>API: DELETE /api/activity/project/<project_id>  (delete_project_activities)
  API->>DB: DELETE FROM activity WHERE project_id=...
  DB-->>API: ok
  API-->>FE: 204
  FE->>API: GET /api/activity/<project_id>  (refresh)
  API-->>FE: 200 []
```

---

## 5) Single activity detail & actions (cancel / retry)
**Page**: `src/routes/activity.$activityId.tsx`

> Endpoints reflected below are from `urls.txt`. 

```mermaid
sequenceDiagram
  autonumber
  participant FE as FE src/routes/activity.$activityId.tsx
  participant API as BE (/api/*)
  participant Worker as Background worker
  participant DB as Database

  Note over FE: Activity detail loads
  FE->>API: GET /api/activity/activity/<activity_id>  (get_activity)
  API->>DB: SELECT * FROM activity WHERE id=...
  DB-->>API: row
  API-->>FE: 200 {activity}

  alt User cancels activity
    FE->>API: POST/DELETE /api/activity/activity/<activity_id>  (cancel_activity)
    API->>Worker: signal cancel
    Worker-->>API: ack
    API-->>FE: 202/200 {status:"cancelled"}
  else User retries activity
    FE->>API: POST /api/activity/retry/<activity_id>  (restart_activity)
    API->>Worker: queue retry
    Worker-->>API: queued
    API-->>FE: 202 {status:"queued"}
  end

  Note over FE: Refresh details
  FE->>API: GET /api/activity/activity/<activity_id>  (get_activity)
  API-->>FE: 200 {activity}
```

---


## 6) Home/index (optional helpers)
**Pages**: `src/routes/index.tsx`, `src/routes/__root.tsx`

> Endpoints reflected below are from `urls.txt`. 

```mermaid
sequenceDiagram
  autonumber
  participant FE as FE src/routes/index.tsx
  participant Root as FE src/routes/__root.tsx
  participant API as BE (/api/*)

  Note over Root: App shell mounts
  Root->>API: GET /api/  (api-root)
  API-->>Root: 200 {links,...}

  Note over FE: Optional link discovery
  FE->>API: GET /api/urls/  (get_children_url)
  API-->>FE: 200 {children:[...]}

  Note over FE: (Docs page)
  FE->>API: GET /api/openapi.json  (openapi-json)
  API-->>FE: 200 {...OpenAPI JSON...}
```

---

## Appendix: One‑glance map (pages → endpoints)
> Endpoints reflected below are from `urls.txt`. 

```mermaid
flowchart LR
  subgraph Frontend src/routes
    A[index.tsx]
    B[project.index.tsx]
    C[-project.index.tables.tsx]
    D[project.create.tsx]
    E[project.$projectId.activities.tsx]
    F[-project.activities.tables.tsx]
    G[activity.$activityId.tsx]
    H[project.$projectId.offload.tsx]
    I[-project.offload.tables.tsx]
    R[__root.tsx]
  end

  subgraph API /api/
    P1[/project/ list, create, bulk delete /]
    P2[/project/id/project_id get/]
    P3[/project/project_id delete/]
    P4[/project/preview/ preview/]
    P5[/project/load load/]
    A1[/activity/project_id list/]
    A2[/activity/activity/activity_id get,cancel/]
    A3[/activity/retry/activity_id retry/]
    A4[/activity/offload/project_id offload/]
    A5[/activity/project/project_id delete project activities/]
    O1[/organisation/ list/]
    R1[/researcher/ list/]
    U1[/urls/ children/]
  end

  A --> U1
  A --> P1
  B --> P1
  C --> P1
  D --> O1
  D --> R1
  D --> P1
  E --> P2
  E --> A1
  F --> A1
  G --> A2
  G --> A3
  H --> A4
  I --> A1

```

---

### Notes
- Where HTTP verbs weren’t explicit in `urls.txt`, methods are inferred from operation names (e.g., `list_*` → GET, `create_*` → POST, `delete_*` → DELETE). Adjust if your view definitions differ. citeturn16search1
- Replace or extend the FE page labels if you later refactor `src/routes/*`.
