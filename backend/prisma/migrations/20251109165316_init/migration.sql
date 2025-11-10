-- CreateTable
CREATE TABLE "forms" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "field_name" VARCHAR(255) NOT NULL,
    "field_type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "replaced_by_field_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_versions" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "version_number" INTEGER NOT NULL,
    "form_definition" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entities" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "form_version_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_values" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "form_field_id" INTEGER NOT NULL,
    "field_name" VARCHAR(255) NOT NULL,
    "field_label" VARCHAR(255) NOT NULL,
    "field_type" VARCHAR(50) NOT NULL,
    "field_options" JSONB,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_fields_form_id_is_active_idx" ON "form_fields"("form_id", "is_active");

-- CreateIndex
CREATE INDEX "form_versions_form_id_idx" ON "form_versions"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_versions_form_id_version_number_key" ON "form_versions"("form_id", "version_number");

-- CreateIndex
CREATE INDEX "entities_form_id_idx" ON "entities"("form_id");

-- CreateIndex
CREATE INDEX "entities_form_version_id_idx" ON "entities"("form_version_id");

-- CreateIndex
CREATE INDEX "entity_values_entity_id_idx" ON "entity_values"("entity_id");

-- CreateIndex
CREATE INDEX "entity_values_field_name_idx" ON "entity_values"("field_name");

-- CreateIndex
CREATE UNIQUE INDEX "entity_values_entity_id_form_field_id_key" ON "entity_values"("entity_id", "form_field_id");

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_replaced_by_field_id_fkey" FOREIGN KEY ("replaced_by_field_id") REFERENCES "form_fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_values" ADD CONSTRAINT "entity_values_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_values" ADD CONSTRAINT "entity_values_form_field_id_fkey" FOREIGN KEY ("form_field_id") REFERENCES "form_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
