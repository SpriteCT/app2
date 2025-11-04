"""
SQLAlchemy models for all database tables
"""
from sqlalchemy import Column, String, Text, Date, DateTime, Numeric, SmallInteger, Boolean, ForeignKey, CheckConstraint, UniqueConstraint, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


# Enums
class SLAType(str, enum.Enum):
    PREMIUM = "Premium"
    STANDARD = "Standard"
    BASIC = "Basic"


class SecurityLevelType(str, enum.Enum):
    CRITICAL = "Critical"
    HIGH = "High"


class BillingCycleType(str, enum.Enum):
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    YEARLY = "Yearly"


class ProjectType(str, enum.Enum):
    VULNERABILITY_SCANNING = "Vulnerability Scanning"
    PENETRATION_TEST = "Penetration Test"
    NETWORK_SCANNING = "Network Scanning"
    BAS = "BAS"
    WEB_APPLICATION_SCANNING = "Web Application Scanning"
    COMPLIANCE_CHECK = "Compliance Check"


class ProjectStatus(str, enum.Enum):
    ACTIVE = "Active"
    PLANNING = "Planning"
    ON_HOLD = "On Hold"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class PriorityType(str, enum.Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class AssetStatus(str, enum.Enum):
    IN_OPERATION = "В эксплуатации"
    UNAVAILABLE = "Недоступен"
    IN_MAINTENANCE = "В обслуживании"
    DECOMMISSIONED = "Выведен из эксплуатации"


class VulnStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    FIXED = "Fixed"
    VERIFIED = "Verified"


class TicketStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    FIXED = "Fixed"
    VERIFIED = "Verified"
    CLOSED = "Closed"


# Models
class Worker(Base):
    __tablename__ = "workers"
    
    id = Column(Integer, primary_key=True)
    full_name = Column(Text, nullable=False)
    email = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class AssetType(Base):
    __tablename__ = "asset_types"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Scanner(Base):
    __tablename__ = "scanners"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    short_name = Column(Text, nullable=False)
    industry = Column(Text, nullable=True)
    contact_person = Column(Text, nullable=True)
    position = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    sla = Column(ENUM('Premium', 'Standard', 'Basic', name='sla_type', create_type=False), nullable=False, default='Standard')
    security_level = Column(ENUM('Critical', 'High', name='security_level_type', create_type=False), nullable=False, default='High')
    contract_number = Column(Text, nullable=True)
    contract_date = Column(Date, nullable=True)
    contract_expiry = Column(Date, nullable=True)
    billing_cycle = Column(ENUM('Monthly', 'Quarterly', 'Yearly', name='billing_cycle_type', create_type=False), nullable=False, default='Monthly')
    infra_cloud = Column(Boolean, nullable=False, default=True)
    infra_on_prem = Column(Boolean, nullable=False, default=True)
    notes = Column(Text, nullable=True)
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    additional_contacts = relationship("ClientAdditionalContact", back_populates="client", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="client", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="client")
    vulnerabilities = relationship("Vulnerability", back_populates="client")
    tickets = relationship("Ticket", back_populates="client")
    
    __table_args__ = (
        CheckConstraint("short_name ~ '^[A-Z]{3,4}$'", name="chk_clients_short_name"),
    )


class ClientAdditionalContact(Base):
    __tablename__ = "client_additional_contacts"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    role = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="additional_contacts")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(ENUM('Vulnerability Scanning', 'Penetration Test', 'Network Scanning', 'BAS', 'Web Application Scanning', 'Compliance Check', name='project_type', create_type=False), nullable=False)
    status = Column(ENUM('Active', 'Planning', 'On Hold', 'Completed', 'Cancelled', name='project_status', create_type=False), nullable=False, default='Active')
    priority = Column(ENUM('Critical', 'High', 'Medium', 'Low', name='priority_type', create_type=False), nullable=False, default='High')
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget = Column(Numeric, nullable=True)
    progress = Column(SmallInteger, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="projects")
    team_members = relationship("ProjectTeamMember", back_populates="project", cascade="all, delete-orphan")
    gantt_tasks = relationship("GanttTask", back_populates="project", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("start_date <= end_date", name="chk_project_dates"),
        CheckConstraint("progress >= 0 AND progress <= 100", name="chk_project_progress"),
    )


class ProjectTeamMember(Base):
    __tablename__ = "project_team_members"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="team_members")
    worker = relationship("Worker")
    
    __table_args__ = (
        UniqueConstraint("project_id", "worker_id", name="uq_project_team_member"),
    )


class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False)
    name = Column(Text, nullable=False)
    type_id = Column(Integer, ForeignKey("asset_types.id", ondelete="RESTRICT"), nullable=False)
    ip_address = Column(Text, nullable=True)
    operating_system = Column(Text, nullable=True)
    status = Column(ENUM('В эксплуатации', 'Недоступен', 'В обслуживании', 'Выведен из эксплуатации', name='asset_status', create_type=False), nullable=False)
    criticality = Column(ENUM('Critical', 'High', 'Medium', 'Low', name='priority_type', create_type=False), nullable=False)
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
    asset_type_id = Column(Integer, ForeignKey("asset_types.id", ondelete="SET NULL"), nullable=True)
    scanner_id = Column(Integer, ForeignKey("scanners.id", ondelete="SET NULL"), nullable=True)
    status = Column(ENUM('Open', 'In Progress', 'Fixed', 'Verified', name='vuln_status', create_type=False), nullable=False)
    criticality = Column(ENUM('Critical', 'High', 'Medium', 'Low', name='priority_type', create_type=False), nullable=False)
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
    asset_type = relationship("AssetType")
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
    assignee_id = Column(Integer, ForeignKey("workers.id", ondelete="SET NULL"), nullable=True)
    reporter_id = Column(Integer, ForeignKey("workers.id", ondelete="SET NULL"), nullable=True)
    priority = Column(ENUM('Critical', 'High', 'Medium', 'Low', name='priority_type', create_type=False), nullable=False)
    status = Column(ENUM('Open', 'In Progress', 'Fixed', 'Verified', 'Closed', name='ticket_status', create_type=False), nullable=False, default='Open')
    is_deleted = Column(Boolean, nullable=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    due_date = Column(Date, nullable=True)
    resolution = Column(Text, nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="tickets")
    assignee = relationship("Worker", foreign_keys=[assignee_id])
    reporter = relationship("Worker", foreign_keys=[reporter_id])
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
    author_id = Column(Integer, ForeignKey("workers.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    ticket = relationship("Ticket", back_populates="messages")
    author = relationship("Worker")


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

