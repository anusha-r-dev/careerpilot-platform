# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_04_010007) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "email_imports", force: :cascade do |t|
    t.string "company", null: false
    t.integer "confidence", default: 50, null: false
    t.datetime "created_at", null: false
    t.datetime "detected_at", null: false
    t.bigint "imported_application_id"
    t.integer "inferred_status", default: 1, null: false
    t.string "job_url", null: false
    t.bigint "mailbox_connection_id", null: false
    t.string "provider_message_id", null: false
    t.datetime "received_at", null: false
    t.string "sender"
    t.text "snippet"
    t.string "source_name"
    t.integer "state", default: 0, null: false
    t.string "subject", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["imported_application_id"], name: "index_email_imports_on_imported_application_id"
    t.index ["mailbox_connection_id", "provider_message_id"], name: "index_email_imports_on_connection_and_message", unique: true
    t.index ["mailbox_connection_id"], name: "index_email_imports_on_mailbox_connection_id"
    t.index ["received_at"], name: "index_email_imports_on_received_at"
    t.index ["user_id", "state"], name: "index_email_imports_on_user_id_and_state"
    t.index ["user_id"], name: "index_email_imports_on_user_id"
  end

  create_table "interviews", force: :cascade do |t|
    t.string "contact_name"
    t.datetime "created_at", null: false
    t.integer "duration_minutes", default: 45, null: false
    t.integer "interview_type", default: 1, null: false
    t.bigint "job_application_id", null: false
    t.string "meeting_url"
    t.text "notes"
    t.datetime "starts_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_application_id"], name: "index_interviews_on_job_application_id"
    t.index ["starts_at"], name: "index_interviews_on_starts_at"
  end

  create_table "job_applications", force: :cascade do |t|
    t.date "applied_on"
    t.string "company", null: false
    t.datetime "created_at", null: false
    t.string "employment_type"
    t.bigint "job_source_id"
    t.string "job_url", null: false
    t.string "location"
    t.date "next_action_on"
    t.text "notes"
    t.boolean "remote", default: false, null: false
    t.string "salary_note"
    t.integer "status", default: 0, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["job_source_id"], name: "index_job_applications_on_job_source_id"
    t.index ["next_action_on"], name: "index_job_applications_on_next_action_on"
    t.index ["user_id", "job_url"], name: "index_job_applications_on_user_id_and_job_url", unique: true
    t.index ["user_id", "status"], name: "index_job_applications_on_user_id_and_status"
    t.index ["user_id"], name: "index_job_applications_on_user_id"
  end

  create_table "job_portal_profiles", force: :cascade do |t|
    t.string "account_label", limit: 80
    t.string "applications_url", limit: 2048
    t.datetime "created_at", null: false
    t.bigint "job_source_id", null: false
    t.datetime "last_opened_at"
    t.string "profile_url", limit: 2048
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["job_source_id"], name: "index_job_portal_profiles_on_job_source_id"
    t.index ["user_id", "job_source_id"], name: "index_portal_profiles_on_user_and_source", unique: true
    t.index ["user_id"], name: "index_job_portal_profiles_on_user_id"
  end

  create_table "job_sources", force: :cascade do |t|
    t.string "accent", default: "indigo", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "home_url", null: false
    t.string "name", null: false
    t.boolean "remote_focused", default: false, null: false
    t.string "search_url", null: false
    t.datetime "updated_at", null: false
    t.index ["active", "remote_focused"], name: "index_job_sources_on_active_and_remote_focused"
    t.index ["active"], name: "index_job_sources_on_active"
    t.index ["name"], name: "index_job_sources_on_name", unique: true
  end

  create_table "mailbox_connections", force: :cascade do |t|
    t.text "access_token_ciphertext"
    t.datetime "connected_at"
    t.datetime "created_at", null: false
    t.boolean "demo", default: false, null: false
    t.string "email", null: false
    t.text "last_error"
    t.datetime "last_synced_at"
    t.integer "provider", default: 0, null: false
    t.text "refresh_token_ciphertext"
    t.string "scope"
    t.integer "status", default: 0, null: false
    t.datetime "token_expires_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "provider"], name: "index_mailbox_connections_on_user_and_provider", unique: true
    t.index ["user_id"], name: "index_mailbox_connections_on_user_id"
  end

  create_table "user_sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "ip_address"
    t.string "token_digest", null: false
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["expires_at"], name: "index_user_sessions_on_expires_at"
    t.index ["token_digest"], name: "index_user_sessions_on_token_digest", unique: true
    t.index ["user_id"], name: "index_user_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "headline"
    t.string "location"
    t.string "name", null: false
    t.string "password_digest", null: false
    t.integer "role", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "email_imports", "job_applications", column: "imported_application_id", on_delete: :nullify
  add_foreign_key "email_imports", "mailbox_connections"
  add_foreign_key "email_imports", "users"
  add_foreign_key "interviews", "job_applications"
  add_foreign_key "job_applications", "job_sources"
  add_foreign_key "job_applications", "users"
  add_foreign_key "job_portal_profiles", "job_sources"
  add_foreign_key "job_portal_profiles", "users"
  add_foreign_key "mailbox_connections", "users"
  add_foreign_key "user_sessions", "users"
end
