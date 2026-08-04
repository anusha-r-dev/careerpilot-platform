class Interview < ApplicationRecord
  belongs_to :job_application

  enum :interview_type, {
    phone: 0,
    video: 1,
    onsite: 2,
    technical: 3
  }, default: :video

  validates :starts_at, :interview_type, presence: true
  validates :duration_minutes,
    numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 480 }

  scope :upcoming, -> { where("starts_at >= ?", Time.current).order(:starts_at) }
end
