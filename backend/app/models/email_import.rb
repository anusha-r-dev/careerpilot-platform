class EmailImport < ApplicationRecord
  belongs_to :user
  belongs_to :mailbox_connection
  belongs_to :imported_application,
    class_name: "JobApplication",
    optional: true

  enum :inferred_status, {
    saved: 0,
    applied: 1,
    interview: 2,
    offer: 3,
    rejected: 4,
    withdrawn: 5
  }, default: :applied
  enum :state, { pending: 0, imported: 1, ignored: 2 }, default: :pending

  validates :provider_message_id,
    presence: true,
    uniqueness: { scope: :mailbox_connection_id }
  validates :subject, :received_at, :company, :title, :job_url,
    :inferred_status, :state, :detected_at,
    presence: true
  validates :confidence,
    numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validate :connection_belongs_to_user

  scope :newest_first, -> { order(received_at: :desc) }

  private

  def connection_belongs_to_user
    return if mailbox_connection.blank? || user_id == mailbox_connection.user_id

    errors.add(:mailbox_connection, "must belong to the same member")
  end
end
