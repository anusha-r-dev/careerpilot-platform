class CreateJobPortalProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :job_portal_profiles do |t|
      t.references :user, null: false, foreign_key: true
      t.references :job_source, null: false, foreign_key: true
      t.string :account_label, limit: 80
      t.string :profile_url, limit: 2048
      t.string :applications_url, limit: 2048
      t.datetime :last_opened_at

      t.timestamps
    end

    add_index :job_portal_profiles,
      %i[user_id job_source_id],
      unique: true,
      name: "index_portal_profiles_on_user_and_source"
  end
end
