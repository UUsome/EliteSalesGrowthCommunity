from pydantic import BaseModel


class ExpertCard(BaseModel):
    id: int
    name: str
    avatar_url: str | None = None
    field: str
    one_liner: str | None = None
    rating: float = 5.0
    price: float


class HotJobItem(BaseModel):
    id: int
    title: str
    company_name: str
    location: str
    salary_display: str | None = None
    is_referral: bool = False
    is_urgent: bool = False


class ContentItem(BaseModel):
    id: int
    title: str
    content_type: str
    summary: str | None = None
    cover_image: str | None = None


class HotDiscussionItem(BaseModel):
    id: int
    title: str
    category: str
    like_count: int = 0
    comment_count: int = 0


class DiscoveryResponse(BaseModel):
    hot_discussions: list[HotDiscussionItem] = []
    expert_picks: list[ExpertCard] = []
    hot_jobs: list[HotJobItem] = []
    featured_content: list[ContentItem] = []
    essence_discussions: list[HotDiscussionItem] = []
