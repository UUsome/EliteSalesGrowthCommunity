from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    company_name: str = Field(..., min_length=1, max_length=100)
    company_logo: str | None = None
    location: str = Field(..., max_length=200)
    is_remote: bool = False
    salary_min: int | None = Field(None, ge=0)
    salary_max: int | None = Field(None, ge=0)
    is_referral: bool = False
    is_urgent: bool = False
    special_requirements: str | None = Field(None, max_length=500)
    contact_name: str = Field(..., max_length=50)
    contact_title: str | None = Field(None, max_length=100)
    contact_id: int | None = Field(None, ge=0)
    industry: str | None = Field(None, max_length=100)
    job_type: str | None = Field(None, max_length=100)
    description: str | None = Field(None, max_length=5000)


class JobUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    company_name: str | None = None
    location: str | None = None
    is_remote: bool | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    is_referral: bool | None = None
    is_urgent: bool | None = None
    special_requirements: str | None = None
    contact_name: str | None = None
    contact_title: str | None = None
    contact_id: int | None = Field(None, ge=0)
    industry: str | None = None
    job_type: str | None = None
    description: str | None = None


class JobResponse(BaseModel):
    id: int
    title: str
    company_name: str
    company_logo: str | None = None
    location: str
    is_remote: bool = False
    salary_min: int | None = None
    salary_max: int | None = None
    salary_display: str | None = None
    is_referral: bool = False
    is_urgent: bool = False
    special_requirements: str | None = None
    contact_name: str
    contact_title: str | None = None
    contact_id: int | None = Field(None, ge=0)
    industry: str | None = None
    job_type: str | None = None
    description: str | None = None
    days_ago: int = 0
    is_active: bool = True
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class JobFilter(BaseModel):
    job_type: str | None = None
    industry: str | None = None
    city: str | None = None
    is_urgent: bool | None = None
    is_referral: bool | None = None
