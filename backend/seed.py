import asyncio
from sqlalchemy.future import select
from app.database import Base, engine, AsyncSessionLocal
from app.model.user import User
from app.model.schedule import Schedule
from app.model.duty import Duty
from app.model.swap import Swap
from app.model.notification import Notification
from app.model.billing import BillingClaim
from app.model.feature_flag import FeatureFlag
from app.model.semester import Semester
from app.model.invite_token import InviteToken
from app.services.security import hash_password
from app.services.features import init_feature_flags
from app.services.semesters import init_semesters

async def seed_data():
    # Recreate all tables with updated schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("Purging existing data...")
        await session.execute(InviteToken.__table__.delete())
        await session.execute(BillingClaim.__table__.delete())
        await session.execute(Notification.__table__.delete())
        await session.execute(Swap.__table__.delete())
        await session.execute(Duty.__table__.delete())
        await session.execute(Schedule.__table__.delete())
        await session.execute(Semester.__table__.delete())
        await session.execute(User.__table__.delete())
        await session.commit()

        print("Initializing Feature Flags...")
        await init_feature_flags(session)

        print("Initializing Semesters...")
        await init_semesters(session)

        print("Inserting Users...")
        # Password for all demo accounts is "password"
        hashed = hash_password("password")

        users = [
            User(name="Alice Smith", email="alice@univ.edu", department_id="2021-1-60-001", hashed_password=hashed, role="Student"),
            User(name="Bob Johnson", email="bob@univ.edu", department_id="2021-1-60-045", hashed_password=hashed, role="Student"),
            User(name="Charlie Brown", email="charlie@univ.edu", department_id="2021-1-60-089", hashed_password=hashed, role="Student"),
            User(name="Diana Prince", email="diana@univ.edu", department_id="2021-1-60-112", hashed_password=hashed, role="Student"),
            User(name="Dr. Sarah Connor", email="sarah@univ.edu", department_id="FAC-0021", hashed_password=hashed, role="Faculty"),
            User(name="Prof. Alan Turing", email="alan@univ.edu", department_id="MGR-0001", hashed_password=hashed, role="DeptManager"),
        ]
        session.add_all(users)
        await session.commit()

        # Retrieve user IDs
        res_alice = await session.execute(select(User).where(User.email == "alice@univ.edu"))
        alice = res_alice.scalars().first()
        res_bob = await session.execute(select(User).where(User.email == "bob@univ.edu"))
        bob = res_bob.scalars().first()
        res_charlie = await session.execute(select(User).where(User.email == "charlie@univ.edu"))
        charlie = res_charlie.scalars().first()
        res_diana = await session.execute(select(User).where(User.email == "diana@univ.edu"))
        diana = res_diana.scalars().first()

        print("Inserting Academic Schedules & Overrides...")
        schedules = [
            # Autumn 2026 (Active)
            # Alice: Classes
            Schedule(student_id=alice.id, day_of_week="Monday", start_time="09:00", end_time="11:00", course_code="CSE451", is_override=False, semester="Autumn 2026"),
            Schedule(student_id=alice.id, day_of_week="Wednesday", start_time="11:00", end_time="13:00", course_code="CSE302", is_override=False, semester="Autumn 2026"),
            # Alice: Manual override
            Schedule(student_id=alice.id, day_of_week="Friday", start_time="14:00", end_time="15:00", is_override=True, semester="Autumn 2026"),

            # Bob: Classes
            Schedule(student_id=bob.id, day_of_week="Monday", start_time="13:00", end_time="15:00", course_code="MAT203", is_override=False, semester="Autumn 2026"),
            Schedule(student_id=bob.id, day_of_week="Wednesday", start_time="14:00", end_time="16:00", course_code="PHY101", is_override=False, semester="Autumn 2026"),
            # Bob: Manual override
            Schedule(student_id=bob.id, day_of_week="Monday", start_time="09:00", end_time="11:00", is_override=True, semester="Autumn 2026"),

            # Charlie: Classes
            Schedule(student_id=charlie.id, day_of_week="Tuesday", start_time="09:00", end_time="11:00", course_code="CSE110", is_override=False, semester="Autumn 2026"),
            Schedule(student_id=charlie.id, day_of_week="Friday", start_time="10:00", end_time="12:00", course_code="CSE220", is_override=False, semester="Autumn 2026"),

            # Summer 2026 (Archived Historical Schedules)
            Schedule(student_id=alice.id, day_of_week="Sunday", start_time="10:00", end_time="12:00", course_code="CSE201", is_override=False, semester="Summer 2026"),
            Schedule(student_id=bob.id, day_of_week="Tuesday", start_time="11:00", end_time="13:00", course_code="CSE205", is_override=False, semester="Summer 2026"),
        ]
        session.add_all(schedules)
        await session.commit()

        print("Inserting Duties...")
        duties = [
            # Autumn 2026 Duties
            Duty(
                title="Software Engineering Lab Assistance",
                date="2026-08-03",  # Monday
                day_of_week="Monday",
                start_time="13:00",
                end_time="15:00",
                assigned_student_id=alice.id,
                notes='{"location": "Lab Room 302", "type": "LabDuty", "assignedFaculty": "Dr. Sarah Connor (Faculty)"}',
                semester="Autumn 2026"
            ),
            Duty(
                title="Database System Lab Support",
                date="2026-08-05",  # Wednesday
                day_of_week="Wednesday",
                start_time="09:00",
                end_time="11:00",
                assigned_student_id=bob.id,
                notes='{"location": "Lab Room 304", "type": "LabDuty", "assignedFaculty": "Dr. Sarah Connor (Faculty)"}',
                semester="Autumn 2026"
            ),
            Duty(
                title="Hardware Inventory Audit",
                date="2026-08-07",  # Friday
                day_of_week="Friday",
                start_time="14:00",
                end_time="16:00",
                assigned_student_id=charlie.id,
                notes='{"location": "Store Room 104", "type": "GeneralDuty", "assignedFaculty": "Prof. Alan Turing (Manager)"}',
                semester="Autumn 2026"
            ),
            Duty(
                title="Linear Algebra Exam Invigilation",
                date="2026-08-05",  # Wednesday
                day_of_week="Wednesday",
                start_time="14:00",
                end_time="16:00",
                assigned_student_id=diana.id,
                notes='{"location": "Auditorium B", "type": "ExamDuty", "assignedFaculty": "Prof. Alan Turing (Manager)"}',
                semester="Autumn 2026"
            ),

            # Summer 2026 (Archived Historical Duties)
            Duty(
                title="Algorithms Lab Supervision",
                date="2026-07-15",
                day_of_week="Wednesday",
                start_time="10:00",
                end_time="12:00",
                assigned_student_id=alice.id,
                status="Completed",
                notes='{"location": "Lab Room 201", "type": "LabDuty", "assignedFaculty": "Dr. Sarah Connor (Faculty)"}',
                semester="Summer 2026"
            ),
            Duty(
                title="Final Term Exam Proctoring",
                date="2026-07-22",
                day_of_week="Wednesday",
                start_time="13:00",
                end_time="16:00",
                assigned_student_id=bob.id,
                status="Completed",
                notes='{"location": "Auditorium A", "type": "ExamDuty", "assignedFaculty": "Prof. Alan Turing (Manager)"}',
                semester="Summer 2026"
            ),
        ]
        session.add_all(duties)
        await session.commit()

        # Retrieve Duty IDs
        res_duties = await session.execute(select(Duty))
        db_duties = res_duties.scalars().all()
        db_duty_invig = next(d for d in db_duties if "Invigilation" in d.title)
        db_duty_db = next(d for d in db_duties if "Database" in d.title)

        print("Inserting Swaps...")
        swaps = [
            # Diana swaps Invigilation (Pending)
            Swap(
                duty_id=db_duty_invig.id,
                requester_id=diana.id,
                target_student_id=None,  # Public broadcast
                status="Pending",
                reason="Urgent family appointment"
            ),
            # Bob swaps Database (Completed / Accepted)
            Swap(
                duty_id=db_duty_db.id,
                requester_id=bob.id,
                target_student_id=alice.id,  # Private swap
                status="Accepted",
                reason="Makeup lab session overlap"
            ),
        ]
        session.add_all(swaps)
        await session.commit()

        print("Inserting Notifications...")
        notifs = [
            Notification(
                user_id=alice.id,
                title="Shift Swap Broadcast",
                message=f"Diana Prince is looking to swap their shift: 'Linear Algebra Exam Invigilation' on 2026-08-05. Reason: Urgent family appointment."
            ),
            Notification(
                user_id=bob.id,
                title="Swap Request Accepted",
                message="Alice Smith accepted your shift swap request for 'Database System Lab Support'."
            ),
        ]
        session.add_all(notifs)
        await session.commit()

        print("Inserting Billing Claims...")
        claims = [
            # Summer 2026 Historical Claims
            BillingClaim(student_id=alice.id, month="June 2026", hours_logged=24.0, hourly_rate=150.0, amount=3600.0, status="Paid", semester="Summer 2026"),
            BillingClaim(student_id=bob.id, month="July 2026", hours_logged=18.0, hourly_rate=150.0, amount=2700.0, status="Paid", semester="Summer 2026"),

            # Autumn 2026 Active Claims
            BillingClaim(student_id=charlie.id, month="September 2026", hours_logged=30.0, hourly_rate=150.0, amount=4500.0, status="Pending", semester="Autumn 2026"),
            BillingClaim(student_id=diana.id, month="September 2026", hours_logged=12.0, hourly_rate=150.0, amount=1800.0, status="Rejected", semester="Autumn 2026"),
        ]
        session.add_all(claims)
        await session.commit()

    print("Database seeded successfully with dummy demo data!")

if __name__ == "__main__":
    asyncio.run(seed_data())
