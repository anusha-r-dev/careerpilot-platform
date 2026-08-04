class AddRemoteFocusedToJobSources < ActiveRecord::Migration[8.1]
  def change
    add_column :job_sources, :remote_focused, :boolean,
      null: false,
      default: false
    add_index :job_sources, %i[active remote_focused]
  end
end
