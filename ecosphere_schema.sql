-- ============================================================
-- EcoSphere ESG Management Platform — PostgreSQL Schema
-- Scoped hackathon version (6-hour build)
-- ============================================================

-- Clean slate (safe to re-run during setup/testing)
DROP TABLE IF EXISTS compliance_issues CASCADE;
DROP TABLE IF EXISTS employee_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS employee_participation CASCADE;
DROP TABLE IF EXISTS csr_activities CASCADE;
DROP TABLE IF EXISTS carbon_transactions CASCADE;
DROP TABLE IF EXISTS emission_factors CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ============================================================
-- MASTER DATA
-- ============================================================

-- Departments
CREATE TABLE departments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    code            VARCHAR(20) NOT NULL UNIQUE,
    head_employee_id INTEGER,          -- FK added after employees table exists
    status          VARCHAR(10) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Employees (also acts as the "user" table for auth)
CREATE TABLE employees (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    department_id   INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'Employee'
                        CHECK (role IN ('Admin', 'Manager', 'Employee')),
    status          VARCHAR(10) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    xp_points       INTEGER NOT NULL DEFAULT 0 CHECK (xp_points >= 0),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Now link department -> head employee
ALTER TABLE departments
    ADD CONSTRAINT fk_department_head
    FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ============================================================
-- ENVIRONMENTAL MODULE
-- ============================================================

-- Emission factors: how much CO2 one unit of an activity produces
CREATE TABLE emission_factors (
    id              SERIAL PRIMARY KEY,
    activity_name   VARCHAR(100) NOT NULL,   -- e.g. "Diesel Fuel", "Electricity (kWh)"
    unit            VARCHAR(20) NOT NULL,    -- e.g. "liter", "kWh"
    co2_per_unit    NUMERIC(10, 4) NOT NULL CHECK (co2_per_unit >= 0), -- kg CO2 per unit
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Carbon transactions: actual logged emissions
CREATE TABLE carbon_transactions (
    id                  SERIAL PRIMARY KEY,
    department_id       INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    emission_factor_id  INTEGER NOT NULL REFERENCES emission_factors(id),
    quantity            NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    co2_emitted         NUMERIC(10, 4) NOT NULL,  -- quantity * co2_per_unit, computed in app layer
    transaction_date    DATE NOT NULL,
    created_by          INTEGER REFERENCES employees(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SOCIAL MODULE (CSR)
-- ============================================================

CREATE TABLE csr_activities (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    category        VARCHAR(50) NOT NULL,     -- e.g. "Environment", "Education", "Health"
    description     TEXT,
    activity_date   DATE NOT NULL,
    points_value    INTEGER NOT NULL DEFAULT 10 CHECK (points_value >= 0),
    created_by      INTEGER REFERENCES employees(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tracks which employee took part in which activity
CREATE TABLE employee_participation (
    id                  SERIAL PRIMARY KEY,
    employee_id         INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    activity_id         INTEGER NOT NULL REFERENCES csr_activities(id) ON DELETE CASCADE,
    proof_url           VARCHAR(255),          -- link/path to uploaded proof file
    approval_status     VARCHAR(15) NOT NULL DEFAULT 'Pending'
                            CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    points_earned       INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
    completion_date     DATE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id, activity_id)  -- an employee can only join an activity once
);

-- ============================================================
-- GAMIFICATION MODULE
-- ============================================================

CREATE TABLE badges (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL UNIQUE,
    description         TEXT,
    unlock_xp_threshold INTEGER NOT NULL CHECK (unlock_xp_threshold >= 0),
    icon_url            VARCHAR(255)
);

-- Junction table: which employees have unlocked which badges
CREATE TABLE employee_badges (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    badge_id        INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id, badge_id)  -- can't unlock the same badge twice
);

-- ============================================================
-- GOVERNANCE MODULE
-- ============================================================

CREATE TABLE compliance_issues (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    owner_id        INTEGER NOT NULL REFERENCES employees(id),
    due_date        DATE NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'Open'
                        CHECK (status IN ('Open', 'Closed')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for common lookups/filters)
-- ============================================================

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_carbon_tx_department ON carbon_transactions(department_id);
CREATE INDEX idx_carbon_tx_date ON carbon_transactions(transaction_date);
CREATE INDEX idx_participation_employee ON employee_participation(employee_id);
CREATE INDEX idx_participation_status ON employee_participation(approval_status);
CREATE INDEX idx_compliance_status_due ON compliance_issues(status, due_date);

-- ============================================================
-- SEED DATA (optional — useful for quick local testing)
-- ============================================================

INSERT INTO departments (name, code) VALUES
    ('Operations', 'OPS'),
    ('Human Resources', 'HR'),
    ('Engineering', 'ENG');

INSERT INTO emission_factors (activity_name, unit, co2_per_unit) VALUES
    ('Diesel Fuel', 'liter', 2.68),
    ('Electricity', 'kWh', 0.45),
    ('Air Travel', 'km', 0.15);

INSERT INTO badges (name, description, unlock_xp_threshold) VALUES
    ('Green Starter', 'Earned your first sustainability points', 10),
    ('Eco Champion', 'Reached 100 XP through participation', 100),
    ('Sustainability Hero', 'Reached 500 XP through participation', 500);
