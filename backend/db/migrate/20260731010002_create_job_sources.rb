class CreateJobSources < ActiveRecord::Migration[8.1]
  def change
    create_table :job_sources do |t|
      t.string :name, null: false
      t.string :home_url, null: false
      t.string :search_url, null: false
      t.string :accent, null: false, default: "indigo"
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :job_sources, :name, unique: true
    add_index :job_sources, :active
  end
end
