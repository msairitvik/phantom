import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["entity"] == "PHANTOM"

@pytest.mark.asyncio
async def test_system_status():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/system/status")
        assert res.status_code == 200
        data = res.json()
        assert "app_name" in data
        assert "active_model" in data

@pytest.mark.asyncio
async def test_workspace_validate_invalid():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/workspaces/validate", json={"path": "C:/invalid_nonexistent_dir_999"})
        assert res.status_code == 200
        data = res.json()
        assert data["valid"] is False

@pytest.mark.asyncio
async def test_settings_get_and_put():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/settings")
        assert res.status_code == 200
        data = res.json()
        assert data["ollama_model"] is not None

        # Update animation level
        put_res = await client.put("/api/settings", json={"animation_level": "low"})
        assert put_res.status_code == 200
        assert put_res.json()["animation_level"] == "low"
