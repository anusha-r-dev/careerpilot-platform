class CreateJobApplicationsAndInterviews < ActiveRecord::Migration[8.1]
  def change
    create_table :job_applications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :job_source, foreign_key: true
      t.string :company, null: false
      t.string :title, null: false
      t.string :location
      t.string :employment_type
      t.string :job_url, null: false
      t.integer :status, null: false, default: 0
      t.text :notes
      t.date :applied_on
      t.date :next_action_on
      t.string :salary_note
      t.boolean :remote, null: false, default: false

      t.timestamps
    end

    add_index :job_applications, %i[user_id job_url], unique: true
    add_index :job_applications, %i[user_id status]
    add_index :job_applications, :next_action_on

    create_table :interviews do |t|
      t.references :job_application, null: false, foreign_key: true
      t.datetime :starts_at, null: false
      t.integer :interview_type, null: false, default: 1
      t.integer :duration_minutes, null: false, default: 45
      t.string :contact_name
      t.string :meeting_url
      t.text :notes

      t.timestamps
    end

    add_index :interviews, :starts_at
  end
end
