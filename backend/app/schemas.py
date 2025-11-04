"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from app.models import (
    SLAType, SecurityLevelType, BillingCycleType, ProjectType, ProjectStatus,
    PriorityType, AssetStatus, VulnStatus, TicketStatus
)


# Base schemas with common fields
class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: datetime


# Worker schemas
class WorkerBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class WorkerCreate(WorkerBase):
    pass


class WorkerUpdate(WorkerBase):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class Worker(WorkerBase, TimestampMixin):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# Asset Type schemas
class AssetTypeBase(BaseModel):
    name: str


class AssetTypeCreate(AssetTypeBase):
    pass


class AssetTypeUpdate(AssetTypeBase):
    name: Optional[str] = None


class AssetType(AssetTypeBase, TimestampMixin):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# Scanner schemas
class ScannerBase(BaseModel):
    name: str


class ScannerCreate(ScannerBase):
    pass


class ScannerUpdate(ScannerBase):
    name: Optional[str] = None


class Scanner(ScannerBase, TimestampMixin):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# Client Additional Contact schemas
class ClientAdditionalContactBase(BaseModel):
    name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class ClientAdditionalContactCreate(ClientAdditionalContactBase):
    pass


class ClientAdditionalContactUpdate(ClientAdditionalContactBase):
    name: Optional[str] = None


class ClientAdditionalContact(ClientAdditionalContactBase, TimestampMixin):
    id: int
    client_id: int
    
    model_config = ConfigDict(from_attributes=True)


# Client schemas
class ClientBase(BaseModel):
    name: str
    short_name: str = Field(..., pattern="^[A-Z]{3,4}$")
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    sla: str = "Standard"
    security_level: str = "High"
    contract_number: Optional[str] = None
    contract_date: Optional[date] = None
    contract_expiry: Optional[date] = None
    billing_cycle: str = "Monthly"
    infra_cloud: bool = True
    infra_on_prem: bool = True
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    additional_contacts: Optional[List[ClientAdditionalContactCreate]] = []


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = Field(None, pattern="^[A-Z]{3,4}$")
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    sla: Optional[str] = None
    security_level: Optional[str] = None
    contract_number: Optional[str] = None
    contract_date: Optional[date] = None
    contract_expiry: Optional[date] = None
    billing_cycle: Optional[str] = None
    infra_cloud: Optional[bool] = None
    infra_on_prem: Optional[bool] = None
    notes: Optional[str] = None


class Client(ClientBase, TimestampMixin):
    id: int
    additional_contacts: List[ClientAdditionalContact] = []
    
    model_config = ConfigDict(from_attributes=True)


# Project Team Member schemas
class ProjectTeamMemberBase(BaseModel):
    worker_id: int


class ProjectTeamMemberCreate(ProjectTeamMemberBase):
    pass


class ProjectTeamMember(ProjectTeamMemberBase, TimestampMixin):
    id: int
    project_id: int
    worker: Optional[Worker] = None
    
    model_config = ConfigDict(from_attributes=True)


# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    status: str = "Active"
    priority: str = "High"
    start_date: date
    end_date: date
    budget: Optional[float] = None


class ProjectCreate(ProjectBase):
    client_id: int
    team_member_ids: Optional[List[int]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    team_member_ids: Optional[List[int]] = None


class Project(ProjectBase, TimestampMixin):
    id: int
    client_id: int
    client: Optional[Client] = None
    team_members: List[ProjectTeamMember] = []
    
    model_config = ConfigDict(from_attributes=True)


# Asset schemas
class AssetBase(BaseModel):
    name: str
    type_id: int
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    status: str
    criticality: str
    last_scan: Optional[datetime] = None


class AssetCreate(AssetBase):
    client_id: int


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type_id: Optional[int] = None
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    status: Optional[str] = None
    criticality: Optional[str] = None
    last_scan: Optional[datetime] = None


class Asset(AssetBase, TimestampMixin):
    id: int
    client_id: int
    is_deleted: bool = False
    client: Optional[Client] = None
    type: Optional[AssetType] = None
    
    model_config = ConfigDict(from_attributes=True)


# Vulnerability schemas
class VulnerabilityBase(BaseModel):
    title: str
    description: Optional[str] = None
    asset_id: Optional[int] = None
    scanner_id: Optional[int] = None
    status: str
    criticality: str
    cvss: Optional[float] = Field(None, ge=0, le=10)
    cve: Optional[str] = None
    discovered: Optional[date] = None
    last_modified: Optional[date] = None


class VulnerabilityCreate(VulnerabilityBase):
    client_id: int


class VulnerabilityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    asset_id: Optional[int] = None
    scanner_id: Optional[int] = None
    status: Optional[str] = None
    criticality: Optional[str] = None
    cvss: Optional[float] = Field(None, ge=0, le=10)
    cve: Optional[str] = None
    discovered: Optional[date] = None
    last_modified: Optional[date] = None


class Vulnerability(VulnerabilityBase, TimestampMixin):
    id: int
    display_id: Optional[str] = None
    client_id: int
    is_deleted: bool = False
    client: Optional[Client] = None
    asset: Optional[Asset] = None
    scanner: Optional[Scanner] = None
    
    model_config = ConfigDict(from_attributes=True)


# Ticket Message schemas
class TicketMessageBase(BaseModel):
    message: str


class TicketMessageCreate(TicketMessageBase):
    author_id: Optional[int] = None


class TicketMessage(TicketMessageBase, TimestampMixin):
    id: int
    ticket_id: int
    author_id: Optional[int] = None
    timestamp: datetime
    author: Optional[Worker] = None
    
    model_config = ConfigDict(from_attributes=True)


# Ticket schemas
class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str
    status: str = "Open"
    assignee_id: Optional[int] = None
    reporter_id: Optional[int] = None
    due_date: Optional[date] = None
    resolution: Optional[str] = None


class TicketCreate(TicketBase):
    client_id: int
    vulnerability_ids: Optional[List[int]] = []


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[int] = None
    reporter_id: Optional[int] = None
    due_date: Optional[date] = None
    resolution: Optional[str] = None
    vulnerability_ids: Optional[List[int]] = None


class Ticket(TicketBase, TimestampMixin):
    id: int
    display_id: Optional[str] = None
    client_id: int
    is_deleted: bool = False
    assignee_id: Optional[int] = None
    reporter_id: Optional[int] = None
    vulnerabilities: List[Vulnerability] = []
    assignee: Optional[Worker] = None
    reporter: Optional[Worker] = None
    client: Optional[Client] = None
    messages: List[TicketMessage] = []
    
    model_config = ConfigDict(from_attributes=True)


# Gantt Task schemas
class GanttTaskBase(BaseModel):
    name: str
    start_date: date
    end_date: date


class GanttTaskCreate(GanttTaskBase):
    project_id: int


class GanttTaskUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class GanttTask(GanttTaskBase, TimestampMixin):
    id: int
    project_id: int
    
    model_config = ConfigDict(from_attributes=True)

