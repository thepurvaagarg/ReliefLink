```python
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# ReliefLink - disaster response coordination demo
# -----------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
INDEX_FILE = BASE_DIR / "index.html"

app = FastAPI(
    title="ReliefLink",
    description="A lightweight disaster-response coordination prototype.",
    version="1.0.0",
)

DEMO_USERS = {
    "coordinator@relieflink.demo": {
        "password": "demo123",
        "role": "coordinator",
        "name": "Aarav Mehta",
    },
    "affected@relieflink.demo": {
        "password": "demo123",
        "role": "affected",
        "name": "Demo Resident",
    },
    "ngo@relieflink.demo": {
        "password": "demo123",
        "role": "ngo",
        "name": "Sahyog Response Team",
    },
}

requests_db = [
    {
        "id": "RL-1048",
        "type": "MEDICAL",
        "location": "Seelampur, Delhi",
        "need": "Insulin + first-aid",
        "qty": "18 kits",
        "priority": 96,
        "status": "URGENT",
        "age": "06 min",
        "lat": 28.6692,
        "lng": 77.2874,
    },
    {
        "id": "RL-1047",
        "type": "FOOD",
        "location": "Yamuna Khadar",
        "need": "Ready-to-eat meals",
        "qty": "240 packs",
        "priority": 88,
        "status": "MATCHED",
        "age": "11 min",
        "lat": 28.6908,
        "lng": 77.2735,
    },
    {
        "id": "RL-1046",
        "type": "SHELTER",
        "location": "Mayur Vihar Phase 1",
        "need": "Tarpaulins + blankets",
        "qty": "70 sets",
        "priority": 79,
        "status": "ROUTING",
        "age": "18 min",
        "lat": 28.6085,
        "lng": 77.2946,
    },
    {
        "id": "RL-1045",
        "type": "WATER",
        "location": "Wazirabad",
        "need": "Drinking water",
        "qty": "900 L",
        "priority": 74,
        "status": "OPEN",
        "age": "23 min",
        "lat": 28.7185,
        "lng": 77.2310,
    },
    {
        "id": "RL-1044",
        "type": "RESCUE",
        "location": "Okhla Phase II",
        "need": "Boat + 4 responders",
        "qty": "1 team",
        "priority": 69,
        "status": "OPEN",
        "age": "31 min",
        "lat": 28.5300,
        "lng": 77.2790,
    },
]

resources = [
    {
        "id": "R-221",
        "name": "Medical kits",
        "owner": "Sahyog Response",
        "available": 36,
        "unit": "kits",
        "status": "READY",
        "near": "Shahdara",
        "lat": 28.674,
        "lng": 77.289,
    },
    {
        "id": "R-219",
        "name": "Water tankers",
        "owner": "Jal Seva NGO",
        "available": 4,
        "unit": "tankers",
        "status": "READY",
        "near": "Wazirabad",
        "lat": 28.72,
        "lng": 77.23,
    },
    {
        "id": "R-214",
        "name": "Meal packs",
        "owner": "FoodRelief Delhi",
        "available": 680,
        "unit": "packs",
        "status": "READY",
        "near": "Patparganj",
        "lat": 28.63,
        "lng": 77.29,
    },
    {
        "id": "R-210",
        "name": "Shelter sets",
        "owner": "Asha Foundation",
        "available": 112,
        "unit": "sets",
        "status": "EN ROUTE",
        "near": "Mayur Vihar",
        "lat": 28.61,
        "lng": 77.30,
    },
    {
        "id": "R-203",
        "name": "Rescue boat",
        "owner": "Civic Rescue Unit",
        "available": 2,
        "unit": "boats",
        "status": "READY",
        "near": "Okhla",
        "lat": 28.53,
        "lng": 77.28,
    },
    {
        "id": "R-199",
        "name": "Volunteers",
        "owner": "Nagrik Network",
        "available": 28,
        "unit": "people",
        "status": "READY",
        "near": "Laxmi Nagar",
        "lat": 28.63,
        "lng": 77.28,
    },
]

alerts = [
    {
        "id": "A-71",
        "level": "HIGH",
        "title": "Waterlogging / flood watch",
        "area": "East Delhi corridor",
        "source": "DEMO / IMD-style warning feed",
        "time": "10:58",
    },
    {
        "id": "A-69",
        "level": "MEDIUM",
        "title": "Road access reduced",
        "area": "Wazirabad approach",
        "source": "DEMO field report",
        "time": "10:51",
    },
    {
        "id": "A-67",
        "level": "HIGH",
        "title": "Shelter capacity pressure",
        "area": "Mayur Vihar",
        "source": "DEMO NGO update",
        "time": "10:44",
    },
    {
        "id": "A-64",
        "level": "INFO",
        "title": "Relief convoy checked in",
        "area": "Patparganj",
        "source": "DEMO tracker",
        "time": "10:37",
    },
]

activity = [
    {
        "time": "11:06",
        "text": "R-221 medical kits matched to RL-1048",
        "kind": "MATCH",
    },
    {
        "time": "11:03",
        "text": "Road report updated: Wazirabad approach",
        "kind": "ROUTE",
    },
    {
        "time": "10:59",
        "text": "NGO Sahyog Response checked in 36 medical kits",
        "kind": "RESOURCE",
    },
    {
        "time": "10:54",
        "text": "RL-1047 verified by field coordinator",
        "kind": "VERIFY",
    },
    {
        "time": "10:48",
        "text": "Shelter request RL-1046 escalated",
        "kind": "PRIORITY",
    },
]


class LoginBody(BaseModel):
    email: str
    password: str


class ResourceBody(BaseModel):
    name: str = Field(min_length=1)
    owner: str = Field(min_length=1)
    available: int = Field(ge=1)
    unit: str = Field(min_length=1)
    near: str = Field(min_length=1)
    status: str = "READY"
    lat: Optional[float] = None
    lng: Optional[float] = None


class NeedBody(BaseModel):
    name: str = Field(min_length=1)
    phone: str = Field(min_length=5)
    need_type: str = Field(min_length=1)
    location: str = Field(min_length=1)
    details: str = ""
    people: int = Field(default=1, ge=1)
    lat: Optional[float] = None
    lng: Optional[float] = None


@app.get("/", include_in_schema=False)
def home():
    """Serve the single-page ReliefLink dashboard."""
    return FileResponse(INDEX_FILE)


@app.get("/health", include_in_schema=False)
def health_check():
    """Health endpoint used by Render and monitoring tools."""
    return {"status": "ok"}


@app.get("/api/state")
def get_state():
    """Return the current demo state used by the dashboard."""
    return {
        "requests": requests_db,
        "resources": resources,
        "alerts": alerts,
        "activity": activity,
        "stats": {
            "active_incidents": 12,
            "open_requests": sum(
                item["status"] in {"OPEN", "URGENT"} for item in requests_db
            ),
            "resources_ready": 918,
            "teams_deployed": 27,
            "avg_match": "04:18",
            "coverage": "83%",
        },
        "demo": True,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/login")
def login(body: LoginBody):
    """Authenticate one of the three built-in demo personas."""
    email = body.email.strip().lower()
    user = DEMO_USERS.get(email)

    if not user or user["password"] != body.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid demo credentials",
        )

    return {
        "ok": True,
        "user": {
            "email": email,
            "role": user["role"],
            "name": user["name"],
        },
    }


@app.post("/api/needs")
def create_need(body: NeedBody):
    """Add a new relief request to the live demo queue."""
    request_id = f"RL-{1050 + len(requests_db)}"

    request = {
        "id": request_id,
        "type": body.need_type.upper(),
        "location": body.location.strip(),
        "need": body.details.strip() or body.need_type.strip(),
        "qty": f"{body.people} people",
        "priority": 90,
        "status": "NEW",
        "age": "now",
        "lat": body.lat or 28.6139,
        "lng": body.lng or 77.2090,
    }

    requests_db.insert(0, request)

    activity.insert(
        0,
        {
            "time": "now",
            "text": (
                f"{request_id} submitted by affected resident "
                "— awaiting verification"
            ),
            "kind": "NEW",
        },
    )

    return {"ok": True, "request": request}


@app.post("/api/resources")
def create_resource(body: ResourceBody):
    """Register a resource so coordinators can see it immediately."""
    resource_id = f"R-{222 + len(resources)}"

    resource = {
        "id": resource_id,
        "name": body.name.strip(),
        "owner": body.owner.strip(),
        "available": body.available,
        "unit": body.unit.strip(),
        "status": body.status.upper(),
        "near": body.near.strip(),
        "lat": body.lat or 28.6139,
        "lng": body.lng or 77.2090,
    }

    resources.insert(0, resource)

    activity.insert(
        0,
        {
            "time": "now",
            "text": (
                f"{resource['owner']} registered "
                f"{resource['available']} {resource['unit']} "
                f"of {resource['name']}"
            ),
            "kind": "RESOURCE",
        },
    )

    return {"ok": True, "resource": resource}


@app.post("/api/dispatch/{request_id}")
def dispatch_request(request_id: str):
    """Mark a relief request as dispatched."""
    for request in requests_db:
        if request["id"] == request_id:
            request["status"] = "DISPATCHED"

            activity.insert(
                0,
                {
                    "time": "now",
                    "text": (
                        f"{request_id} dispatched to the nearest "
                        "eligible resource"
                    ),
                    "kind": "DISPATCH",
                },
            )

            return {"ok": True, "request": request}

    raise HTTPException(
        status_code=404,
        detail="Request not found",
    )
```
