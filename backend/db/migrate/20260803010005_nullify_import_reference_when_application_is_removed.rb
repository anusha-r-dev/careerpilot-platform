class NullifyImportReferenceWhenApplicationIsRemoved < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :email_imports, column: :imported_application_id
    add_foreign_key :email_imports,
      :job_applications,
      column: :imported_application_id,
      on_delete: :nullify
  end
end
