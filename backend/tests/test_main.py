import random

import pytest
from httpx import AsyncClient, ASGITransport

from src.database import engine, Base
from src.main import app


@pytest.fixture
async def client():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_register_and_login(client):
    phone = f"139{random.randint(10000000, 99999999)}"
    uname = f"testuser{random.randint(1000, 9999)}"
    # Register
    resp = await client.post(
        "/api/auth/register",
        json={"username": uname, "password": "test123456", "phone": phone},
    )
    assert resp.status_code == 201
    user = resp.json()
    # username includes random suffix

    # Login
    resp = await client.post(
        "/api/auth/login",
        data={"username": uname, "password": "test123456"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    assert token is not None

    # Get me
    resp = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert "testuser" in resp.json()["username"]


@pytest.mark.asyncio
async def test_discovery(client):
    resp = await client.get("/api/discovery")
    assert resp.status_code == 200
    data = resp.json()
    assert "hot_discussions" in data
    assert "essence_discussions" in data
