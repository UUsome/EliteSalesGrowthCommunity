from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.models import Question, Answer, UserFavorite, Notification
from src.shared.exceptions import NotFound, BadRequest


# --- Questions ---
async def list_questions(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Question]:
    result = await db.execute(
        select(Question).order_by(Question.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_question(db: AsyncSession, question_id: int) -> Question:
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise NotFound("问题不存在")
    question.view_count = (question.view_count or 0) + 1
    await db.commit()
    await db.refresh(question)
    return question


async def create_question(db: AsyncSession, user_id: int, question_in) -> Question:
    question = Question(
        user_id=user_id,
        title=question_in.title,
        content=question_in.content,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


async def create_answer(
    db: AsyncSession, question_id: int, user_id: int, content: str
) -> Answer:
    question = await get_question(db, question_id)
    answer = Answer(
        question_id=question_id,
        user_id=user_id,
        content=content,
    )
    db.add(answer)
    question.answer_count = (question.answer_count or 0) + 1
    await db.commit()
    await db.refresh(answer)
    return answer


# --- Favorites ---
async def toggle_favorite(
    db: AsyncSession, user_id: int, target_type: str, target_id: int
) -> UserFavorite | None:
    result = await db.execute(
        select(UserFavorite).where(
            UserFavorite.user_id == user_id,
            UserFavorite.target_type == target_type,
            UserFavorite.target_id == target_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
        return None  # Removed

    fav = UserFavorite(
        user_id=user_id,
        target_type=target_type,
        target_id=target_id,
    )
    db.add(fav)
    await db.commit()
    await db.refresh(fav)
    return fav


async def list_favorites(
    db: AsyncSession,
    user_id: int,
    target_type: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[UserFavorite]:
    query = select(UserFavorite).where(UserFavorite.user_id == user_id)
    if target_type:
        query = query.where(UserFavorite.target_type == target_type)
    query = query.order_by(UserFavorite.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


# --- Notifications ---
async def get_notifications(
    db: AsyncSession,
    user_id: int,
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 20,
) -> list[Notification]:
    query = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        query = query.where(Notification.is_read == False)
    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def mark_notification_read(
    db: AsyncSession, notification_id: int, user_id: int
) -> Notification:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise NotFound("通知不存在")
    notif.is_read = True
    await db.commit()
    await db.refresh(notif)
    return notif


async def mark_all_read(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
    )
    notifications = result.scalars().all()
    count = 0
    for n in notifications:
        n.is_read = True
        count += 1
    await db.commit()
    return count


async def create_notification(
    db: AsyncSession,
    user_id: int,
    notif_type: str,
    title: str,
    content: str,
    related_id: int | None = None,
    related_type: str | None = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=notif_type,
        title=title,
        content=content,
        related_id=related_id,
        related_type=related_type,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif


# --- Dashboard ---
async def get_dashboard(db: AsyncSession, user_id: int):
    # Questions
    q_result = await db.execute(
        select(func.count(Question.id)).where(Question.user_id == user_id)
    )
    question_count = q_result.scalar() or 0

    pq_result = await db.execute(
        select(func.count(Question.id)).where(
            Question.user_id == user_id, Question.status == "pending"
        )
    )
    pending_question_count = pq_result.scalar() or 0

    # Answers
    a_result = await db.execute(
        select(func.count(Answer.id)).where(Answer.user_id == user_id)
    )
    answer_count = a_result.scalar() or 0

    aa_result = await db.execute(
        select(func.count(Answer.id)).where(
            Answer.user_id == user_id, Answer.is_accepted == True
        )
    )
    accepted_answer_count = aa_result.scalar() or 0

# Favorites
    f_result = await db.execute(
        select(func.count(UserFavorite.id)).where(UserFavorite.user_id == user_id)
    )
    favorite_count = f_result.scalar() or 0

    # Unread notifications
    n_result = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
    )
    unread_notification_count = n_result.scalar() or 0

    from src.users.schemas import DashboardResponse
    return DashboardResponse(
        question_count=question_count,
        pending_question_count=pending_question_count,
        answer_count=answer_count,
        accepted_answer_count=accepted_answer_count,
        favorite_count=favorite_count,
        unread_notification_count=unread_notification_count,
    )
