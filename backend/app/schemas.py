from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Status = Literal["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"]
Priority = Literal["LOW", "MEDIUM", "HIGH"]

class AppointmentCreate(BaseModel):
    patient_name: str = Field(min_length=1, max_length=200)
    doctor: str = "Unassigned"
    reason: str = ""
    priority: Priority = "MEDIUM"
    status: Status = "SCHEDULED"
    appointment_at: datetime | None = None

class AppointmentUpdate(BaseModel):
    patient_name: str | None = Field(default=None, min_length=1, max_length=200)
    doctor: str | None = None
    reason: str | None = None
    priority: Priority | None = None
    status: Status | None = None
    appointment_at: datetime | None = None

class AppointmentOut(BaseModel):
    id: int
    patient_name: str
    doctor: str
    reason: str
    priority: Priority
    status: Status
    appointment_at: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StatsOut(BaseModel):
    total: int
    scheduled: int
    checkedIn: int
    completed: int
    cancelled: int
