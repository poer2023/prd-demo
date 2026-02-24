# Phase A API Contract

## POST `/api/compiler/jobs`

Request body:

```json
{
  "projectId": "essaypass",
  "prdContent": "# PRD\n...",
  "title": "EssayPass PRD",
  "requestedBy": "local-user"
}
```

Response `202`:

```json
{
  "success": true,
  "data": {
    "jobId": "cmpjob_...",
    "status": "queued",
    "createdAt": "2026-02-24T..."
  }
}
```

## GET `/api/compiler/jobs/{jobId}`

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "cmpjob_...",
    "projectId": "essaypass",
    "status": "succeeded",
    "result": {
      "specId": "spec_...",
      "warnings": []
    },
    "error": null
  }
}
```

## GET `/api/compiler/specs/{specId}`

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "spec_...",
    "version": "1.0.0",
    "meta": {},
    "pages": [],
    "tokens": {},
    "traces": [],
    "quality": {}
  }
}
```
