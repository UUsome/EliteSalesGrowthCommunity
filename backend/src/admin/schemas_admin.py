from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# ─── User Admin ────────────────────────────────────────
class UserAdminResponse(BaseModel):
    id: int
    username: str
    phone: str
    avatar_url: str | None = None
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserAdminUpdate(BaseModel):
    username: str | None = Field(None, min_length=2, max_length=50)
    phone: str | None = Field(None, pattern=r"^1[3-9]\d{9}$")
    is_active: bool | None = None
    is_superuser: bool | None = None


class UserAdminCreate(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    is_active: bool = True
    is_superuser: bool = False


# ─── Generic list response with count ──────────────────
class ListResponse(BaseModel):
    items: list
    total: int
    skip: int = 0
    limit: int = 20
