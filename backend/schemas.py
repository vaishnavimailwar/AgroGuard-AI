from pydantic import BaseModel, Field, field_validator


class FarmerCreate(BaseModel):
    name: str
    mobile: str
    email: str
    password: str
    village: str


class FarmerLogin(BaseModel):
    email: str
    password: str


class FarmCreate(BaseModel):
    farm_name: str
    crop_type: str
    farm_type: str | None = None
    season: str | None = None
    area: float
    latitude: float
    longitude: float
    farmer_id: int


class MissionCreate(BaseModel):
    mission_name: str = Field(min_length=3, max_length=100)
    farmer_id: int
    farm_id: int

    @field_validator("mission_name")
    @classmethod
    def validate_mission_name(cls, value):
        cleaned_value = value.strip()
        if len(cleaned_value) < 3:
            raise ValueError("Mission name must contain at least 3 characters")
        return cleaned_value