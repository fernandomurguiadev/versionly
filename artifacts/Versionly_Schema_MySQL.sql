-- ============================================================
-- VERSIONLY — Schema MySQL 8.0  v1.2
-- Auditado contra especificación funcional + sistema de roles
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ── USERS ────────────────────────────────────────────────────
-- [FIX v1.2] email_verified_at: AF define verificación de email obligatoria
CREATE TABLE users (
  id                CHAR(36)     NOT NULL,
  email             VARCHAR(255) NOT NULL,
  password_hash     TEXT         NOT NULL,
  full_name         VARCHAR(255),
  email_verified_at DATETIME(6),
  created_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── PASSWORD RESET TOKENS ────────────────────────────────────
-- [NEW v1.2] AF define: recuperación de contraseña por email
CREATE TABLE password_reset_tokens (
  id         CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(255) NOT NULL,
  expires_at DATETIME(6)  NOT NULL,
  used_at    DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_prt_token (token),
  KEY idx_prt_user_id    (user_id),
  KEY idx_prt_expires_at (expires_at),
  CONSTRAINT fk_prt_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── WORKSPACES ───────────────────────────────────────────────
CREATE TABLE workspaces (
  id         CHAR(36)     NOT NULL,
  name       VARCHAR(255) NOT NULL,
  created_by CHAR(36),
  created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_workspaces_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── WORKSPACE MEMBERS ────────────────────────────────────────
CREATE TABLE workspace_members (
  id           CHAR(36)                        NOT NULL,
  workspace_id CHAR(36)                        NOT NULL,
  user_id      CHAR(36)                        NOT NULL,
  role         ENUM('admin','editor','viewer') NOT NULL,
  created_at   DATETIME(6)                     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_workspace_members (workspace_id, user_id),
  CONSTRAINT fk_wm_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_wm_user
    FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [FIX v1.2] Regla de negocio #1: workspace siempre tiene al menos un Admin.
DELIMITER $$

CREATE TRIGGER trg_workspace_members_before_delete
BEFORE DELETE ON workspace_members
FOR EACH ROW
BEGIN
  DECLARE admin_count INT;
  IF OLD.role = 'admin' THEN
    SELECT COUNT(*) INTO admin_count
    FROM   workspace_members
    WHERE  workspace_id = OLD.workspace_id AND role = 'admin' AND id != OLD.id;
    IF admin_count = 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede eliminar al ultimo administrador del workspace.';
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_workspace_members_before_update
BEFORE UPDATE ON workspace_members
FOR EACH ROW
BEGIN
  DECLARE admin_count INT;
  IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
    SELECT COUNT(*) INTO admin_count
    FROM   workspace_members
    WHERE  workspace_id = OLD.workspace_id AND role = 'admin' AND id != OLD.id;
    IF admin_count = 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede quitar el rol admin al ultimo administrador del workspace.';
    END IF;
  END IF;
END$$

DELIMITER ;

-- ── WORKSPACE INVITATIONS ────────────────────────────────────
-- [NEW v1.2] Flujo de roles: invitación a emails sin cuenta registrada
CREATE TABLE workspace_invitations (
  id           CHAR(36)               NOT NULL,
  workspace_id CHAR(36)               NOT NULL,
  email        VARCHAR(255)           NOT NULL,
  role         ENUM('editor','viewer') NOT NULL,
  token        VARCHAR(255)           NOT NULL,
  expires_at   DATETIME(6)            NOT NULL,
  accepted_at  DATETIME(6),
  created_by   CHAR(36),
  created_at   DATETIME(6)            NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_wi_token (token),
  UNIQUE KEY uq_wi_workspace_email (workspace_id, email),
  KEY idx_wi_expires_at (expires_at),
  CONSTRAINT fk_wi_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_wi_created_by
    FOREIGN KEY (created_by)   REFERENCES users(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE projects (
  id           CHAR(36)     NOT NULL,
  workspace_id CHAR(36)     NOT NULL,
  name         VARCHAR(255) NOT NULL,
  created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_projects_workspace_id (workspace_id),
  FULLTEXT KEY ft_projects_name (name),
  CONSTRAINT fk_projects_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── FOLDERS ──────────────────────────────────────────────────
CREATE TABLE folders (
  id         CHAR(36)     NOT NULL,
  project_id CHAR(36)     NOT NULL,
  name       VARCHAR(255) NOT NULL,
  created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_folders_project_id (project_id),
  FULLTEXT KEY ft_folders_name (name),
  CONSTRAINT fk_folders_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── DOCUMENTS ────────────────────────────────────────────────
CREATE TABLE documents (
  id         CHAR(36)     NOT NULL,
  folder_id  CHAR(36)     NOT NULL,
  title      VARCHAR(500) NOT NULL,
  created_by CHAR(36),
  created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_documents_folder_id (folder_id),
  FULLTEXT KEY ft_documents_title (title),
  CONSTRAINT fk_documents_folder
    FOREIGN KEY (folder_id)  REFERENCES folders(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── DOCUMENT MEMBERS ─────────────────────────────────────────
-- [FIX v1.2] can_view_history: el Editor controla acceso al historial por Viewer
CREATE TABLE document_members (
  id               CHAR(36)                NOT NULL,
  document_id      CHAR(36)                NOT NULL,
  user_id          CHAR(36)                NOT NULL,
  role             ENUM('editor','viewer') NOT NULL,
  can_view_history TINYINT(1)              NOT NULL DEFAULT 0,
  created_at       DATETIME(6)             NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_document_members (document_id, user_id),
  CONSTRAINT fk_dm_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_dm_user
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── DOCUMENT DRAFTS ──────────────────────────────────────────
-- Un único borrador por documento (MVP: sin edición simultánea).
-- En v2.0 con colaboración en tiempo real, añadir user_id y cambiar UNIQUE.
CREATE TABLE document_drafts (
  id          CHAR(36)    NOT NULL,
  document_id CHAR(36)    NOT NULL,
  content     JSON        NOT NULL,
  updated_by  CHAR(36),
  created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_document_drafts_document (document_id),
  CONSTRAINT fk_drafts_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_drafts_updated_by
    FOREIGN KEY (updated_by)  REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── DOCUMENT VERSIONS ────────────────────────────────────────
-- [FIX v1.2] based_on_version_id: base para detección de conflicto simultáneo.
--            El cliente envía el ID de la última versión que tenía al empezar.
--            Si ya existe otra versión con el mismo based_on_version_id → conflicto.
-- [FIX v1.2] source: origin de la versión (manual / import / merge).
-- [FIX v1.2] merge_from_a / merge_from_b: trazabilidad de merges.
-- [FIX v1.2] import_warnings: elementos omitidos al importar (JSON array).
-- [NEW v1.1] drive_file_mapping_id: presente cuando la versión se originó desde Google Drive.
--            NULL para versiones manuales o importadas desde .docx local.
CREATE TABLE document_versions (
  id                   CHAR(36)                                      NOT NULL,
  document_id          CHAR(36)                                      NOT NULL,
  name                 VARCHAR(255)                                  NOT NULL,
  comment              TEXT,
  content              JSON                                          NOT NULL,
  created_by           CHAR(36),
  based_on_version_id  CHAR(36),
  source               ENUM('manual','import','merge','drive_import') NOT NULL DEFAULT 'manual',
  merge_from_a         CHAR(36),
  merge_from_b         CHAR(36),
  import_warnings      JSON,
  drive_file_mapping_id CHAR(36),
  is_current           TINYINT(1)                                    NOT NULL DEFAULT 0,
  created_at           DATETIME(6)                                   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_dv_document_id    (document_id),
  KEY idx_dv_is_current     (document_id, is_current),
  KEY idx_dv_based_on       (based_on_version_id),
  KEY idx_dv_drive_mapping  (drive_file_mapping_id),
  CONSTRAINT fk_dv_document
    FOREIGN KEY (document_id)          REFERENCES documents(id)          ON DELETE CASCADE,
  CONSTRAINT fk_dv_created_by
    FOREIGN KEY (created_by)           REFERENCES users(id)              ON DELETE SET NULL,
  CONSTRAINT fk_dv_based_on
    FOREIGN KEY (based_on_version_id)  REFERENCES document_versions(id)  ON DELETE SET NULL,
  CONSTRAINT fk_dv_merge_a
    FOREIGN KEY (merge_from_a)         REFERENCES document_versions(id)  ON DELETE SET NULL,
  CONSTRAINT fk_dv_merge_b
    FOREIGN KEY (merge_from_b)         REFERENCES document_versions(id)  ON DELETE SET NULL
  -- fk_dv_drive_mapping se agrega vía ALTER TABLE al final del schema (v1.1)
  -- después de que drive_file_mappings quede definida.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger: garantiza que solo una versión sea is_current=1 por documento.
DELIMITER $$

CREATE TRIGGER trg_document_versions_before_insert
BEFORE INSERT ON document_versions
FOR EACH ROW
BEGIN
  IF NEW.is_current = 1 THEN
    UPDATE document_versions
    SET    is_current = 0
    WHERE  document_id = NEW.document_id AND is_current = 1;
  END IF;
END$$

CREATE TRIGGER trg_document_versions_before_update
BEFORE UPDATE ON document_versions
FOR EACH ROW
BEGIN
  IF NEW.is_current = 1 AND OLD.is_current = 0 THEN
    UPDATE document_versions
    SET    is_current = 0
    WHERE  document_id = NEW.document_id AND is_current = 1 AND id != NEW.id;
  END IF;
END$$

DELIMITER ;

-- ── DOCUMENT ASSETS ──────────────────────────────────────────
-- [NEW v1.2] Imágenes subidas al editor. storage_key = objeto en R2/S3.
-- La URL pública se construye en la aplicación: baseUrl + storage_key.
CREATE TABLE document_assets (
  id          CHAR(36)     NOT NULL,
  document_id CHAR(36)     NOT NULL,
  uploaded_by CHAR(36),
  filename    VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type   VARCHAR(100) NOT NULL,
  size_bytes  INT UNSIGNED NOT NULL,
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_da_storage_key (storage_key),
  KEY idx_da_document_id (document_id),
  CONSTRAINT fk_da_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_da_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SHARED LINKS ─────────────────────────────────────────────
-- [FIX v1.2] allow_history: controla si el receptor puede ver el historial
CREATE TABLE shared_links (
  id            CHAR(36)                NOT NULL,
  document_id   CHAR(36)                NOT NULL,
  version_id    CHAR(36),
  token         VARCHAR(255)            NOT NULL,
  mode          ENUM('fixed','dynamic') NOT NULL,
  allow_history TINYINT(1)              NOT NULL DEFAULT 0,
  created_by    CHAR(36),
  created_at    DATETIME(6)             NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  revoked_at    DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_shared_links_token (token),
  KEY idx_shared_links_document_id (document_id),
  CONSTRAINT fk_sl_document
    FOREIGN KEY (document_id) REFERENCES documents(id)         ON DELETE CASCADE,
  CONSTRAINT fk_sl_version
    FOREIGN KEY (version_id)  REFERENCES document_versions(id) ON DELETE SET NULL,
  CONSTRAINT fk_sl_created_by
    FOREIGN KEY (created_by)  REFERENCES users(id)             ON DELETE SET NULL,
  CONSTRAINT chk_fixed_link_requires_version
    CHECK (mode != 'fixed' OR version_id IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE shared_link_access_logs (
  id             CHAR(36)     NOT NULL,
  shared_link_id CHAR(36)     NOT NULL,
  ip_address     VARCHAR(45)  NOT NULL,
  user_agent     VARCHAR(500),
  created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_sla_shared_link_id (shared_link_id),
  CONSTRAINT fk_sla_shared_link
    FOREIGN KEY (shared_link_id) REFERENCES shared_links(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── NOTIFICATIONS ────────────────────────────────────────────
-- [FIX v1.2] document_id y related_user_id: columnas directas para queries
--            sin JSON_EXTRACT. payload JSON mantiene datos adicionales.
CREATE TABLE notifications (
  id              CHAR(36)                                                     NOT NULL,
  user_id         CHAR(36)                                                     NOT NULL,
  type            ENUM('new_current_version','save_conflict','member_invited') NOT NULL,
  document_id     CHAR(36),
  related_user_id CHAR(36),
  payload         JSON                                                          NOT NULL,
  created_at      DATETIME(6)                                                   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  read_at         DATETIME(6),
  PRIMARY KEY (id),
  KEY idx_notifications_user_id     (user_id),
  KEY idx_notifications_user_unread (user_id, read_at),
  KEY idx_notifications_document_id (document_id),
  CONSTRAINT fk_notif_user
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  CONSTRAINT fk_notif_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── GOOGLE DRIVE INTEGRATION (v1.1) ─────────────────────────

-- DriveConnection: almacena tokens OAuth2 cifrados por usuario/workspace.
-- access_token y refresh_token se persisten cifrados con AES-256 en la capa de aplicación.
-- Un usuario puede tener a lo sumo una conexión activa por workspace (UNIQUE user_id, workspace_id).
CREATE TABLE drive_connections (
  id               CHAR(36)     NOT NULL,
  user_id          CHAR(36)     NOT NULL,
  workspace_id     CHAR(36)     NOT NULL,
  access_token     TEXT         NOT NULL,  -- cifrado AES-256 antes de persistir
  refresh_token    TEXT         NOT NULL,  -- cifrado AES-256 antes de persistir
  token_expires_at DATETIME(6),
  scopes           VARCHAR(500) NOT NULL,
  created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  revoked_at       DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_dc_user_workspace (user_id, workspace_id),
  KEY idx_dc_workspace (workspace_id),
  CONSTRAINT fk_dc_user
    FOREIGN KEY (user_id)      REFERENCES users(id)       ON DELETE CASCADE,
  CONSTRAINT fk_dc_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DriveFileMapping: mapea un documento Versionly ↔ un archivo Google Drive.
-- Relación 1:1 con documents (UNIQUE document_id): un documento solo puede estar
-- vinculado a un único archivo de Drive a la vez.
-- La importación es siempre intencional (iniciada por el usuario); no hay auto-sync en v1.1.
CREATE TABLE drive_file_mappings (
  id                      CHAR(36)      NOT NULL,
  document_id             CHAR(36)      NOT NULL,
  drive_connection_id     CHAR(36)      NOT NULL,
  drive_file_id           VARCHAR(255)  NOT NULL,
  drive_file_name         VARCHAR(500),
  drive_web_link          VARCHAR(1000),
  last_synced_at          DATETIME(6),
  last_remote_modified_at DATETIME(6),
  sync_enabled            TINYINT(1)    NOT NULL DEFAULT 1,
  created_at              DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_dfm_document (document_id),
  KEY idx_dfm_connection (drive_connection_id),
  CONSTRAINT fk_dfm_document
    FOREIGN KEY (document_id)         REFERENCES documents(id)         ON DELETE CASCADE,
  CONSTRAINT fk_dfm_connection
    FOREIGN KEY (drive_connection_id) REFERENCES drive_connections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK diferida: document_versions → drive_file_mappings (v1.1)
-- Se aplica aquí porque drive_file_mappings debe existir antes de agregar la FK.
ALTER TABLE document_versions
  ADD CONSTRAINT fk_dv_drive_mapping
    FOREIGN KEY (drive_file_mapping_id) REFERENCES drive_file_mappings(id) ON DELETE SET NULL;

-- ── REFRESH TOKENS ───────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(512) NOT NULL,
  expires_at DATETIME(6)  NOT NULL,
  revoked_at DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_token (token(255)),
  KEY idx_refresh_tokens_user_id    (user_id),
  KEY idx_refresh_tokens_expires_at (expires_at),
  CONSTRAINT fk_rt_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
