from datetime import datetime

from sqlalchemy import String, Float, Integer, DateTime, Boolean, Text, ForeignKey, func
from sqlalchemy import JSON as SQLJSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class Expert(Base):
    __tablename__ = "experts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    field: Mapped[str] = mapped_column(String(100), index=True)
    one_liner: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price: Mapped[float] = mapped_column(Float)
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    consultation_count: Mapped[int] = mapped_column(Integer, default=0)
    response_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    cases = relationship("ExpertCase", back_populates="expert", lazy="selectin",
                         cascade="all, delete-orphan")
    availabilities = relationship("ExpertAvailability", back_populates="expert",
                                  lazy="selectin", cascade="all, delete-orphan")



class ExpertCase(Base):
    __tablename__ = "expert_cases"

    id: Mapped[int] = mapped_column(primary_key=True)
    expert_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("experts.id"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    images: Mapped[list[str]] = mapped_column(SQLJSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    expert = relationship("Expert", back_populates="cases", lazy="selectin")


class ExpertAvailability(Base):
    __tablename__ = "expert_availabilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    expert_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("experts.id"), index=True
    )
    day_of_week: Mapped[int] = mapped_column(Integer)  # 0=Mon..6=Sun
    start_time: Mapped[str] = mapped_column(String(5))
    end_time: Mapped[str] = mapped_column(String(5))
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False)

    expert = relationship("Expert", back_populates="availabilities", lazy="selectin")
