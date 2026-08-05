class CreateUsersAndSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :password_digest, null: false
      t.integer :role, null: false, default: 0
      t.boolean :active, null: false, default: true
      t.string :headline
      t.string :location

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :role

    create_table :user_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.string :ip_address
      t.string :user_agent

      t.timestamps
    end

    add_index :user_sessions, :token_digest, unique: true
    add_index :user_sessions, :expires_at
  end
end
