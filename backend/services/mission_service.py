from sqlalchemy.orm import Session

import models


def create_mission(db: Session, mission):

    new_mission = models.Mission(
        mission_name=mission.mission_name,
        farmer_id=mission.farmer_id,
        farm_id=mission.farm_id
    )

    db.add(new_mission)
    db.commit()
    db.refresh(new_mission)

    return new_mission


def get_all_missions(db: Session):

    return db.query(models.Mission).all()


def update_mission_status(
    db: Session,
    mission_id: int,
    status: str
):

    mission = db.query(models.Mission).filter(
        models.Mission.id == mission_id
    ).first()

    if mission is None:
        return None

    mission.status = status

    db.commit()
    db.refresh(mission)

    return mission


def update_mission_results(
    db: Session,
    mission_id: int,
    video_path: str,
    detection_file: str
):

    mission = db.query(models.Mission).filter(
        models.Mission.id == mission_id
    ).first()

    if mission is None:
        return None

    mission.video_path = video_path
    mission.detection_file = detection_file

    db.commit()
    db.refresh(mission)

    return mission