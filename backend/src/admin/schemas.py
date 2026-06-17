from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


# ─── Site Settings ─────────────────────────────────────
class SiteSettingResponse(BaseModel):
    id: int
    key: str
    value: str | None = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SiteSettingUpdate(BaseModel):
    value: str | None = None
