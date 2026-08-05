class JobSource < ApplicationRecord
  has_many :job_applications, dependent: :nullify
  has_many :job_portal_profiles, dependent: :destroy

  validates :name, :home_url, :search_url, :accent, presence: true
  validates :name, uniqueness: { case_sensitive: false }
  validates :home_url, :search_url,
    format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }

  scope :active, -> { where(active: true) }
end
