class User < ApplicationRecord
  has_secure_password

  enum :role, { member: 0, admin: 1 }, default: :member

  has_many :user_sessions, dependent: :destroy
  has_many :job_applications, dependent: :destroy
  has_many :interviews, through: :job_applications
  has_many :mailbox_connections, dependent: :destroy
  has_many :email_imports, dependent: :destroy
  has_many :job_portal_profiles, dependent: :destroy

  validates :name, presence: true, length: { maximum: 80 }
  validates :email,
    presence: true,
    uniqueness: { case_sensitive: false },
    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true

  before_validation :normalize_email

  scope :active, -> { where(active: true) }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
