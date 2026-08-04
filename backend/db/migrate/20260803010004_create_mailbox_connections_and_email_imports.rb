class CreateMailboxConnectionsAndEmailImports < ActiveRecord::Migration[8.1]
  def change
    create_table :mailbox_connections do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :provider, null: false, default: 0
      t.string :email, null: false
      t.text :access_token_ciphertext
      t.text :refresh_token_ciphertext
      t.datetime :token_expires_at
      t.string :scope
      t.integer :status, null: false, default: 0
      t.boolean :demo, null: false, default: false
      t.datetime :connected_at
      t.datetime :last_synced_at
      t.text :last_error
      t.timestamps
    end

    add_index :mailbox_connections,
      %i[user_id provider],
      unique: true,
      name: "index_mailbox_connections_on_user_and_provider"

    create_table :email_imports do |t|
      t.references :user, null: false, foreign_key: true
      t.references :mailbox_connection, null: false, foreign_key: true
      t.string :provider_message_id, null: false
      t.string :sender
      t.string :subject, null: false
      t.datetime :received_at, null: false
      t.string :company, null: false
      t.string :title, null: false
      t.string :job_url, null: false
      t.string :source_name
      t.integer :inferred_status, null: false, default: 1
      t.integer :confidence, null: false, default: 50
      t.text :snippet
      t.integer :state, null: false, default: 0
      t.references :imported_application,
        foreign_key: { to_table: :job_applications }
      t.datetime :detected_at, null: false
      t.timestamps
    end

    add_index :email_imports,
      %i[mailbox_connection_id provider_message_id],
      unique: true,
      name: "index_email_imports_on_connection_and_message"
    add_index :email_imports, %i[user_id state]
    add_index :email_imports, :received_at
  end
end
