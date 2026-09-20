# ReliefLink — Smart Disaster Relief Coordination Prototype

A full-stack prototype based on the supplied ReliefLink concept. The prototype keeps the main experience inside a single fixed viewport (no page-length scrolling) and includes role-based login, affected-person requests, NGO operations, coordinator dispatch, resource tracking, priority queue, alerts, route planning, and simulated live activity.

## Run

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload
```

Open http://127.0.0.1:8000

## Demo accounts

- Coordinator: `coordinator@relieflink.demo` / `demo123`
- Affected person: `affected@relieflink.demo` / `demo123`
- NGO: `ngo@relieflink.demo` / `demo123`

The dashboard data marked **DEMO / SIMULATED** is intentionally fictional for prototype presentation. It is not an operational disaster feed.

## Data/reference approach

The supplied presentation describes ReliefLink as a decision layer that consolidates disaster requests, resource availability and road conditions into an explainable action queue while retaining human coordinator control.

The UI also references:
- NDMA SACHET for the concept of geo-targeted disaster alerts and official warning sources.
- IMD for district/subdivision warnings and nowcasts.
- OpenStreetMap for open road/map data and attribution.

For a real deployment, official feeds, verified NGO accounts, identity/phone verification, incident validation, routing services, audit logs, and secure data storage would need to replace the demo endpoints.


## Online deployment
See `DEPLOY_RENDER.md` for the Render deployment steps.
