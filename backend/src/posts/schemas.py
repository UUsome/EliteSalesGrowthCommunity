from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=10000)
    category: str = Field(..., pattern=r"^(经验分享|求助提问|行业动态)$")
    is_anonymous: bool = False


class PostUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = None
    category: str | None = Field(None, pattern=r"^(经验分享|求助提问|行业动态)$")
    is_anonymous: bool | None = None


class PostResponse(BaseModel):
    id: int
    user_id: int
    author_name: str | None = None
    author_avatar: str | None = None
    title: str
    content: str
    category: str
    is_anonymous: bool = False
    view_count: int = 0
    like_count: int = 0
    favorite_count: int = 0
    comment_count: int = 0
    is_essence: bool = False
    is_hot: bool = False
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: int | None = None


class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    author_name: str | None = None
    author_avatar: str | None = None
    parent_id: int | None = None
    content: str
    like_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
