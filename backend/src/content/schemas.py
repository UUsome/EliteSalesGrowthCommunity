from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ContentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content_type: str = Field(..., pattern=r"^(销售资料|成功案例|产品更新)$")
    content: str = Field(..., min_length=1, max_length=50000)
    summary: str | None = Field(None, max_length=500)
    cover_image: str | None = None
    author: str | None = Field(None, max_length=100)


class ContentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    summary: str | None = None
    cover_image: str | None = None


class ContentResponse(BaseModel):
    id: int
    title: str
    content_type: str
    content: str
    summary: str | None = None
    cover_image: str | None = None
    author: str | None = None
    like_count: int = 0
    favorite_count: int = 0
    view_count: int = 0
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
