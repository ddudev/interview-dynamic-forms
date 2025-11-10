# Dynamic Forms System

A dynamic forms system built with NestJS backend, Angular frontend, and PostgreSQL database. This system allows users to create custom forms, fill them out, and view submitted data with complete historical accuracy.

## Features

- **Form Builder**: Create custom forms with dynamic fields
- **Form Filler**: Dynamically render and submit forms
- **Entity List**: View all submitted data in a table
- **Historical Accuracy**: Form changes preserve historical data through versioning
- **Field Versioning**: Track field changes without losing data

## Tech Stack

- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Frontend**: Angular, SAP Fundamental NGX Components
- **Database**: PostgreSQL

## Database Schema

The system uses the following main tables:

- **forms**: Form definitions
- **form_fields**: Individual fields within forms (with versioning)
- **form_versions**: Snapshots of form definitions at specific points in time
- **entities**: Submitted form records
- **entity_values**: Field values linked to entities (with denormalized field metadata)

## API Endpoints

### Forms

- `POST /api/forms` - Create a new form
- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get a specific form
- `GET /api/forms/:id/versions` - Get form versions
- `PATCH /api/forms/:id` - Update a form
- `DELETE /api/forms/:id` - Delete a form

### Form Fields

- `POST /api/forms/:formId/fields` - Add a field to a form
- `GET /api/forms/:formId/fields` - Get all fields for a form
- `GET /api/forms/:formId/fields/:fieldId` - Get a specific field
- `PATCH /api/forms/:formId/fields/:fieldId` - Update a field (creates new version)
- `DELETE /api/forms/:formId/fields/:fieldId` - Remove a field (soft delete)

### Entities

- `POST /api/entities` - Create a new entity (submit form)
- `GET /api/entities` - Get all entities (with pagination)
- `GET /api/entities/:id` - Get a specific entity
- `GET /api/entities/:id/display` - Get entity with historical form definition

## Historical Accuracy

The system ensures complete historical accuracy:

- When a form is modified (fields added/removed/changed), a new form version is created
- Each entity submission captures the form version used at that time
- Field values store denormalized metadata (field name, label, type, options) at submission time
- Old submissions remain intact even if fields are removed or modified
- Form fields use soft delete (is_active flag) to preserve historical references

## Architecture Decisions & Tradeoffs

### Why Historical Accuracy Was Prioritized

The core requirement was to ensure that **form submissions remain accurate and interpretable even after form definitions change**. This means:
- A submission from 6 months ago should display exactly as it was submitted
- Field labels, types, and options should reflect what they were at submission time
- Removing or modifying fields should not break historical data

### Design Approach: Multi-Layered Versioning with Denormalization

I implemented a **three-layer approach** to achieve historical accuracy:

#### 1. Form Versioning (`form_versions` table)

**What it does:**
- Creates a snapshot of the entire form definition whenever fields are added, removed, or modified
- Stores the complete form structure as JSONB at each version point
- Links each submission (`entity`) to a specific form version

**Why this approach:**
- Provides a complete "point-in-time" view of the form
- Allows reconstructing the exact form structure used for any submission
- Enables auditing and tracking form evolution over time

**Tradeoffs:**
- **Pros**: Complete historical record, easy to reconstruct forms, supports auditing
- **Cons**: Storage overhead (duplicates form structure), requires version management logic

**Alternative considered:** Only version fields individually
- **Why rejected**: Would require complex joins to reconstruct historical forms, harder to ensure consistency

#### 2. Field Versioning (`form_fields` table with `version` and `replacedByFieldId`)

**What it does:**
- When a field is updated, creates a new field record with incremented version
- Links old field to new field via `replacedByFieldId`
- Marks old field as inactive (`isActive: false`) but preserves it
- When a field is deleted, marks it as inactive but keeps the record

**Why this approach:**
- Preserves the exact field definition used in historical submissions
- Maintains referential integrity (entity_values can still reference old fields)
- Allows tracking field evolution (e.g., "email" field changed from optional to required)

**Tradeoffs:**
- **Pros**: Maintains referential integrity, tracks field changes, supports soft delete
- **Cons**: Multiple records per logical field, requires filtering by `isActive` in queries

**Alternative considered:** Hard delete fields, store field metadata only in entity_values
- **Why rejected**: Would lose ability to track field changes, harder to query field history

#### 3. Denormalization (`entity_values` table)

**What it does:**
- Stores field metadata (name, label, type, options) directly with each submitted value
- Creates a self-contained record that doesn't require joins to understand the value
- Links to both `entity` and `form_field` for referential integrity

**Why this approach:**
- **Primary reason**: Even if a field is deleted or modified, the submission remains interpretable
- Query performance: No need to join multiple tables to display historical submissions
- Data portability: Each entity_value is self-describing

**Tradeoffs:**
- **Pros**: Fast queries (no joins needed), data survives field deletion, self-documenting
- **Cons**: Storage overhead (duplicates field metadata), potential inconsistency if metadata changes after submission

**Alternative considered:** Only store field IDs, join to form_fields for metadata
- **Why rejected**: If field is deleted, metadata would be lost; requires complex joins for historical data

### Why This Three-Layer Approach?

Each layer serves a specific purpose:

1. **Form Versions**: Quick reconstruction of entire form structure
2. **Field Versioning**: Maintains referential integrity and tracks field evolution
3. **Denormalization**: Ensures data survives field deletion and improves query performance

Together, they provide **defense in depth** for historical accuracy:
- If form version is corrupted, can reconstruct from field versions
- If field is deleted, metadata is preserved in entity_values
- Multiple ways to verify and reconstruct historical data

### Specific Tradeoffs

#### Storage Overhead
- **Cost**: ~3x storage compared to normalized approach (form versions + field versions + denormalized values)
- **Benefit**: Complete historical accuracy, faster queries, data survivability
- **Mitigation**: PostgreSQL JSONB compression, indexes on frequently queried fields

#### Query Complexity
- **Cost**: Must filter by `isActive` when querying current fields
- **Benefit**: Historical queries are simpler (no complex joins)
- **Mitigation**: Indexes on `(formId, isActive)` for efficient filtering

#### Update Operations
- **Cost**: Updating a field creates new records instead of updating in place
- **Benefit**: Preserves history, enables audit trails
- **Mitigation**: Soft delete pattern is well-understood, version numbers make tracking easy

#### Data Consistency
- **Cost**: Denormalized metadata could theoretically become inconsistent
- **Benefit**: Historical submissions remain accurate even if current form changes
- **Mitigation**: Metadata is captured at submission time and never updated

### Alternative Approaches Considered

#### 1. Event Sourcing
- **What**: Store all form changes as events, reconstruct state from events
- **Why rejected**: Overkill for this use case, adds significant complexity, harder to query current state

#### 2. Temporal Tables (PostgreSQL)
- **What**: Use PostgreSQL's built-in temporal table features
- **Why rejected**: Less control over versioning strategy, harder to implement soft deletes, more complex queries

#### 3. Separate Historical Tables
- **What**: Copy data to historical tables when forms change
- **Why rejected**: Data duplication without benefits, harder to maintain consistency, more complex queries

#### 4. Only Store Field IDs
- **What**: Store only references, join to get metadata
- **Why rejected**: Data loss if fields deleted, complex joins for historical data, performance issues

### Performance Considerations

**Optimizations implemented:**
- Indexes on `(formId, isActive)` for efficient field queries
- Indexes on `entityId` and `fieldName` in entity_values for fast lookups
- JSONB for form definitions (efficient storage and querying)
- Denormalization reduces join complexity for common queries

**Query patterns:**
- **Current form**: Filter by `isActive: true`, single query
- **Historical submission**: Join entity → form_version → entity_values, no need to join form_fields
- **Field history**: Query form_fields filtered by fieldName, ordered by version

### Conclusion

This architecture prioritizes **data correctness and historical accuracy** over storage efficiency. The tradeoffs are intentional:

- **Storage overhead** is acceptable for complete historical accuracy
- **Complexity** is manageable with clear patterns (versioning, soft deletes)
- **Performance** is optimized through denormalization and strategic indexing

The system ensures that **any submission can be accurately displayed years later**, regardless of how the form definition changes, which is critical for audit trails, compliance, and data integrity.
