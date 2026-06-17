from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# --- Expert (专家) ---
class ExpertBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    avatar_url: str | None = None
    field: str = Field(..., max_length=100)
    one_liner: str | None = Field(None, max_length=200, description="一句话擅长领域")
    description: str | None = Field(None, max_length=2000)
    experience_years: int | None = Field(None, ge=0, le=60)
    price: float = Field(..., gt=0, description="咨询价格")
    rating: float = Field(default=5.0, ge=0, le=5.0)
    response_rate: float | None = Field(None, ge=0, le=100)


class ExpertCreate(ExpertBase):
    user_id: int


class ExpertUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    field: str | None = Field(None, max_length=100)
    one_liner: str | None = Field(None, max_length=200)
    description: str | None = None
    experience_years: int | None = Field(None, ge=0, le=60)
    price: float | None = Field(None, gt=0)
    rating: float | None = Field(None, ge=0, le=5.0)
    response_rate: float | None = Field(None, ge=0, le=100)
    avatar_url: str | None = None


class ExpertListResponse(ExpertBase):
    id: int
    rating_count: int = 0
    consultation_count: int = 0
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExpertResponse(ExpertListResponse):
    cases: list["ExpertCaseResponse"] = []
    availabilities: list["ExpertAvailabilityResponse"] = []


class ExpertFilter(BaseModel):
    field: str | None = None
    price_min: float | None = Field(None, ge=0)
    price_max: float | None = Field(None, ge=0)
    rating_min: float | None = Field(None, ge=0, le=5.0)
    sort_by: str | None = None  # recommended | rating | price_asc | price_desc | most_active


# --- Expert Case (代表案例) ---
class ExpertCaseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    images: list[str] = []


class ExpertCaseResponse(BaseModel):
    id: int
    expert_id: int
    title: str
    description: str | None
    images: list[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Expert Availability (可预约时间) ---
class ExpertAvailabilityCreate(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)  # 0=Mon, 6=Sun
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")


class ExpertAvailabilityResponse(BaseModel):
    id: int
    expert_id: int
    day_of_week: int
    start_time: str
    end_time: str
    is_booked: bool = False

    model_config = ConfigDict(from_attributes=True)
