from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# --- Questions ---
class QuestionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)


class QuestionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    view_count: int = 0
    answer_count: int = 0
    status: str = "pending"  # pending | resolved | expired
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Answers ---
class AnswerCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class AnswerResponse(BaseModel):
    id: int
    question_id: int
    user_id: int
    author_name: str | None = None
    content: str
    like_count: int = 0
    is_accepted: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Favorites ---
class FavoriteResponse(BaseModel):
    id: int
    target_type: str  # question | expert | post | content
    target_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FavoriteCreate(BaseModel):
    target_type: str = Field(..., pattern=r"^(question|expert|post|content)$")
    target_id: int


# --- Notifications ---
class NotificationResponse(BaseModel):
    id: int
    type: str  # answer | booking | system
    title: str
    content: str
    is_read: bool = False
    related_id: int | None = None
    related_type: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Dashboard ---
class DashboardResponse(BaseModel):
    question_count: int = 0
    pending_question_count: int = 0
    answer_count: int = 0
    accepted_answer_count: int = 0
    favorite_count: int = 0
    unread_notification_count: int = 0
