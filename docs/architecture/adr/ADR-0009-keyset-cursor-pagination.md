# ADR-0009: Keyset Cursor Pagination

## Context
Offset-based pagination (`OFFSET 10000 LIMIT 50`) degrades in performance linearly ($O(N)$) as the dataset grows, forcing the database engine to scan and discard thousands of rows. Additionally, offset pagination suffers from page-drift anomalies in real-time geographic event streams: if new observations are inserted while a client paginates, records appear duplicated across page boundaries.

## Decision
All paginated Meridian list endpoints strictly implement **opaque keyset (cursor-based) pagination**.
1. Endpoints accept query parameters:
   - `limit`: Number of items requested (default 20, max configured per endpoint, e.g. 100).
   - `cursor`: An opaque base64url-encoded string encoding the sorting tuple of the last item in the previous page (e.g. `(created_at, id)`).
2. Database queries utilize tuple comparisons backed by compound B-tree indexes:
   ```sql
   WHERE (created_at, id) < ($last_created_at, $last_id)
   ORDER BY created_at DESC, id DESC
   LIMIT $limit + 1;
   ```
3. Responses return an envelope containing:
   ```json
   {
     "data": [...],
     "pagination": {
       "next_cursor": "ZXlKaGJHY2lPaUpTVXp...",
       "has_more": true
     }
   }
   ```
4. If `has_more` is false, `next_cursor` is null.

## Alternatives considered
- **Offset/Limit Pagination (`page=5&limit=20`):** Rejected due to quadratic index scanning overhead on large history tables and duplicate record delivery during active event streaming.
- **Seek Pagination on Sequential ID Alone:** Rejected because items are frequently sorted by timestamp, and timestamps can collide across events within the same millisecond. The compound `(timestamp, id)` tuple guarantees deterministic pagination.

## Consequences
- **Positive:** Constant-time $O(1)$ database execution regardless of pagination depth, immune to insertion/deletion drift, lightweight client integration.
- **Negative:** Clients cannot jump arbitrarily to "page 42"; users navigate sequentially or adjust time-window filters.

## Evidence/links
- Markus Winand: "Use The Index, Luke: Paging Through Results"
- `docs/architecture/api-conventions.md`

## Status
Approved
