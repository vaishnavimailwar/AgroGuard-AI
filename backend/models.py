from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime
)

from database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    mobile = Column(
        String,
        unique=True
    )

    village = Column(
        String
    )


class Farm(Base):
    __tablename__ = "farms"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    farm_name = Column(
        String,
        nullable=False
    )

    crop_type = Column(
        String
    )

    area = Column(
        Float
    )

    latitude = Column(
        Float
    )

    longitude = Column(
        Float
    )

    farmer_id = Column(
        Integer,
        ForeignKey("farmers.id")
    )


class Mission(Base):
    __tablename__ = "missions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    mission_name = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Pending"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    farmer_id = Column(
        Integer,
        ForeignKey("farmers.id")
    )

    farm_id = Column(
        Integer,
        ForeignKey("farms.id")
    )

    # Video uploaded for this mission
    video_path = Column(
        String,
        nullable=True
    )

    # JSON file containing YOLO detection results
    detection_file = Column(
        String,
        nullable=True
    )