"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
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
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)


# Asset Type schemas
class AssetTypeBase(BaseModel):
    name: str
    description: Optional[str] = None


class AssetTypeCreate(AssetTypeBase):
    pass


class AssetTypeUpdate(AssetTypeBase):
    name: Optional[str] = None
    description: Optional[str] = None


class AssetType(AssetTypeBase, TimestampMixin):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)


# Scanner schemas
class ScannerBase(BaseModel):
    name: str
    description: Optional[str] = None


class ScannerCreate(ScannerBase):
    pass


class ScannerUpdate(ScannerBase):
    name: Optional[str] = None
    description: Optional[str] = None


class Scanner(ScannerBase, TimestampMixin):
    id: UUID
    
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
    id: UUID
    client_id: UUID
    
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
    sla: SLAType = SLAType.STANDARD
    security_level: SecurityLevelType = SecurityLevelType.HIGH
    contract_number: Optional[str] = None
    contract_date: Optional[date] = None
    contract_expiry: Optional[date] = None
    billing_cycle: BillingCycleType = BillingCycleType.MONTHLY
    infra_cloud: bool = True
    infra_on_prem: bool = True
    notes: Optional[str] = None
    is_default: bool = False


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
    sla: Optional[SLAType] = None
    security_level: Optional[SecurityLevelType] = None
    contract_number: Optional[str] = None
    contract_date: Optional[date] = None
    contract_expiry: Optional[date] = None
    billing_cycle: Optional[BillingCycleType] = None
    infra_cloud: Optional[bool] = None
    infra_on_prem: Optional[bool] = None
    notes: Optional[str] = None
    is_default: Optional[bool] = None


class Client(ClientBase, TimestampMixin):
    id: UUID
    additional_contacts: List[ClientAdditionalContact] = []
    
    model_config = ConfigDict(from_attributes=True)


# Project Team Member schemas
class ProjectTeamMemberBase(BaseModel):
    worker_id: UUID


class ProjectTeamMemberCreate(ProjectTeamMemberBase):
    pass


class ProjectTeamMember(ProjectTeamMemberBase, TimestampMixin):
    id: UUID
    project_id: UUID
    worker: Optional[Worker] = None
    
    model_config = ConfigDict(from_attributes=True)


# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: ProjectType
    status: ProjectStatus = ProjectStatus.ACTIVE
    priority: PriorityType = PriorityType.HIGH
    start_date: date
    end_date: date
    budget: Optional[float] = None
    progress: int = Field(0, ge=0, le=100)


class ProjectCreate(ProjectBase):
    client_id: UUID
    team_member_ids: Optional[List[UUID]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[ProjectType] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[PriorityType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    team_member_ids: Optional[List[UUID]] = None


class Project(ProjectBase, TimestampMixin):
    id: UUID
    client_id: UUID
    client: Optional[Client] = None
    team_members: List[ProjectTeamMember] = []
    
    model_config = ConfigDict(from_attributes=True)


# Asset schemas
class AssetBase(BaseModel):
    name: str
    type_id: UUID
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    status: AssetStatus
    criticality: PriorityType
    last_scan: Optional[datetime] = None


class AssetCreate(AssetBase):
    client_id: UUID


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type_id: Optional[UUID] = None
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    status: Optional[AssetStatus] = None
    criticality: Optional[PriorityType] = None
    last_scan: Optional[datetime] = None


class Asset(AssetBase, TimestampMixin):
    id: UUID
    client_id: UUID
    client: Optional[Client] = None
    type: Optional[AssetType] = None
    
    model_config = ConfigDict(from_attributes=True)


# Vulnerability schemas
class VulnerabilityBase(BaseModel):
    title: str
    description: Optional[str] = None
    asset_id: Optional[UUID] = None
    asset_type_id: Optional[UUID] = None
    scanner_id: Optional[UUID] = None
    status: VulnStatus
    criticality: PriorityType
    cvss: Optional[float] = Field(None, ge=0, le=10)
    cve: Optional[str] = None
    discovered: Optional[date] = None
    last_modified: Optional[date] = None


class VulnerabilityCreate(VulnerabilityBase):
    client_id: UUID


class VulnerabilityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    asset_id: Optional[UUID] = None
    asset_type_id: Optional[UUID] = None
    scanner_id: Optional[UUID] = None
    status: Optional[VulnStatus] = None
    criticality: Optional[PriorityType] = None
    cvss: Optional[float] = Field(None, ge=0, le=10)
    cve: Optional[str] = None
    discovered: Optional[date] = None
    last_modified: Optional[date] = None


class Vulnerability(VulnerabilityBase, TimestampMixin):
    id: UUID
    client_id: UUID
    client: Optional[Client] = None
    asset: Optional[Asset] = None
    asset_type: Optional[AssetType] = None
    scanner: Optional[Scanner] = None
    
    model_config = ConfigDict(from_attributes=True)


# Ticket Message schemas
class TicketMessageBase(BaseModel):
    message: str


class TicketMessageCreate(TicketMessageBase):
    author_id: Optional[UUID] = None


class TicketMessage(TicketMessageBase, TimestampMixin):
    id: UUID
    ticket_id: UUID
    author_id: Optional[UUID] = None
    timestamp: datetime
    author: Optional[Worker] = None
    
    model_config = ConfigDict(from_attributes=True)


# Ticket schemas
class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityType
    status: TicketStatus = TicketStatus.OPEN
    assignee_id: Optional[UUID] = None
    reporter_id: Optional[UUID] = None
    due_date: Optional[date] = None
    resolution: Optional[str] = None


class TicketCreate(TicketBase):
    client_id: UUID
    vulnerability_ids: Optional[List[UUID]] = []


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityType] = None
    status: Optional[TicketStatus] = None
    assignee_id: Optional[UUID] = None
    reporter_id: Optional[UUID] = None
    due_date: Optional[date] = None
    resolution: Optional[str] = None
    vulnerability_ids: Optional[List[UUID]] = None


class Ticket(TicketBase, TimestampMixin):
    id: UUID
    client_id: UUID
    created_at: datetime
    client: Optional[Client] = None
    assignee: Optional[Worker] = None
    reporter: Optional[Worker] = None
    messages: List[TicketMessage] = []
    vulnerabilities: List[Vulnerability] = []
    
    model_config = ConfigDict(from_attributes=True)


# Gantt Task schemas
class GanttTaskBase(BaseModel):
    name: str
    start_date: date
    end_date: date


class GanttTaskCreate(GanttTaskBase):
    project_id: UUID


class GanttTaskUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class GanttTask(GanttTaskBase, TimestampMixin):
    id: UUID
    project_id: UUID
    
    model_config = ConfigDict(from_attributes=True)

