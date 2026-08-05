class JobApplication < ApplicationRecord
  belongs_to :user
  belongs_to :job_source, optional: true
  has_many :interviews, dependent: :destroy
  has_many :originating_email_imports,
    class_name: "EmailImport",
    foreign_key: :imported_application_id,
    dependent: :nullify,
    inverse_of: :imported_application

  enum :status, {
    saved: 0,
    applied: 1,
    interview: 2,
    offer: 3,
    rejected: 4,
    withdrawn: 5
  }, default: :saved

  validates :company, :title, :job_url, :status, presence: true
  validates :company, :title, length: { maximum: 120 }
  validates :job_url,
    uniqueness: { scope: :user_id },
    format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }

  before_validation :set_applied_date

  scope :active_pipeline, -> { where.not(status: %i[rejected withdrawn]) }

  private

  def set_applied_date
    self.applied_on ||= Time.zone.today if status.in?(%w[applied interview offer])
  end
end
