from pydantic import BaseModel


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
    area: float
    latitude: float
    longitude: float
    farmer_id: int


class MissionCreate(BaseModel):
    mission_name: str
    farmer_id: int
    farm_id: int