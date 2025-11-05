"""
SQLAlchemy models for all database tables
"""
from sqlalchemy import Column, String, Text, Date, DateTime, Numeric, SmallInteger, Boolean, ForeignKey, CheckConstraint, UniqueConstraint, Integer, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    password_hash = Column(Text, nullable=True)
    email = Column(Text, nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client_profile = relationship("ClientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    worker_profile = relationship("WorkerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class ClientProfile(Base):
    __tablename__ = "client_profiles"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    contact_name = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="client_profile")
    client = relationship("Client", back_populates="client_profiles")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="worker_profile")


# ENUM classes
class PriorityType(str, enum.Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class ProjectStatus(str, enum.Enum):
    ACTIVE = "Active"
    PLANNING = "Planning"
    ON_HOLD = "On Hold"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class AssetStatusEnum(str, enum.Enum):
    IN_USE = "В эксплуатации"
    UNAVAILABLE = "Недоступен"
    MAINTENANCE = "В обслуживании"
    DECOMMISSIONED = "Выведен из эксплуатации"


class VulnStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class TicketStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class AssetType(Base):
    __tablename__ = "asset_types"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Scanner(Base):
    __tablename__ = "scanners"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# Reference tables
class ProjectType(Base):
    __tablename__ = "project_types"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    short_name = Column(Text, nullable=False)
    industry = Column(Text, nullable=True)
    contract_number = Column(Text, nullable=True)
    contract_date = Column(Date, nullable=True)
    contract_expiry = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    contacts = relationship("ClientContact", back_populates="client", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="client", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="client")
    client_profiles = relationship("ClientProfile", back_populates="client", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="client")
    tickets = relationship("Ticket", back_populates="client")
    
    __table_args__ = (
        CheckConstraint("short_name ~ '^[A-Z]{3,4}$'", name="chk_clients_short_name"),
    )


class ClientContact(Base):
    __tablename__ = "client_contacts"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    role = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    is_primary = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="contacts")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    type_id = Column(Integer, ForeignKey("project_types.id", ondelete="RESTRICT"), nullable=False)
    status = Column(Enum(ProjectStatus, name="project_status", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    priority = Column(Enum(PriorityType, name="priority_type", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="projects")
    type = relationship("ProjectType")
    team_members = relationship("ProjectTeamMember", back_populates="project", cascade="all, delete-orphan")
    gantt_tasks = relationship("GanttTask", back_populates="project", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("start_date <= end_date", name="chk_project_dates"),
    )


class ProjectTeamMember(Base):
    __tablename__ = "project_team_members"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="team_members")
    user = relationship("User")
    
    __table_args__ = (
        UniqueConstraint("project_id", "user_id", name="uq_project_team_member"),
    )


class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False)
    name = Column(Text, nullable=False)
    type_id = Column(Integer, ForeignKey("asset_types.id", ondelete="RESTRICT"), nullable=False)
    ip_address = Column(Text, nullable=True)
    operating_system = Column(Text, nullable=True)
    status = Column(Enum(AssetStatusEnum, name="asset_status", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    criticality = Column(Enum(PriorityType, name="priority_type", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    last_scan = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(Boolean, nullable=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="assets")
    type = relationship("AssetType")
    vulnerabilities = relationship("Vulnerability", back_populates="asset")


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    
    id = Column(Integer, primary_key=True)
    display_id = Column(Text, nullable=True, unique=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    scanner_id = Column(Integer, ForeignKey("scanners.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(VulnStatus, name="vuln_status", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    criticality = Column(Enum(PriorityType, name="priority_type", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    cvss = Column(Numeric, nullable=True)
    cve = Column(Text, nullable=True)
    discovered = Column(Date, nullable=True)
    last_modified = Column(Date, nullable=True)
    is_deleted = Column(Boolean, nullable=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="vulnerabilities")
    asset = relationship("Asset", back_populates="vulnerabilities")
    scanner = relationship("Scanner")
    ticket_vulnerabilities = relationship("TicketVulnerability", back_populates="vulnerability")
    
    __table_args__ = (
        CheckConstraint("cvss IS NULL OR (cvss >= 0 AND cvss <= 10)", name="chk_vuln_cvss"),
    )


class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True)
    display_id = Column(Text, nullable=True, unique=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    priority = Column(Enum(PriorityType, name="priority_type", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    status = Column(Enum(TicketStatus, name="ticket_status", create_constraint=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    is_deleted = Column(Boolean, nullable=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    due_date = Column(Date, nullable=True)
    resolution = Column(Text, nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="tickets")
    assignee = relationship("User", foreign_keys=[assignee_id])
    reporter = relationship("User", foreign_keys=[reporter_id])
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")
    ticket_vulnerabilities = relationship("TicketVulnerability", back_populates="ticket", cascade="all, delete-orphan")
    
    @property
    def vulnerabilities(self):
        """Get vulnerabilities for this ticket via ticket_vulnerabilities junction"""
        return [tv.vulnerability for tv in self.ticket_vulnerabilities if tv.vulnerability]


class TicketMessage(Base):
    __tablename__ = "ticket_messages"
    
    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    ticket = relationship("Ticket", back_populates="messages")
    author = relationship("User")


class TicketVulnerability(Base):
    __tablename__ = "ticket_vulnerabilities"
    
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    ticket = relationship("Ticket", back_populates="ticket_vulnerabilities")
    vulnerability = relationship("Vulnerability", back_populates="ticket_vulnerabilities")


class GanttTask(Base):
    __tablename__ = "gantt_tasks"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="gantt_tasks")

