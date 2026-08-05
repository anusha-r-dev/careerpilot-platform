class JobPortalProfile < ApplicationRecord
  belongs_to :user
  belongs_to :job_source

  validates :account_label, length: { maximum: 80 }, allow_blank: true
  validates :job_source_id, uniqueness: { scope: :user_id }
  validate :at_least_one_portal_url
  validate :portal_urls_are_secure

  before_validation :normalize_values

  def launch_url
    applications_url.presence || profile_url
  end

  private

  def at_least_one_portal_url
    return if profile_url.present? || applications_url.present?

    errors.add(:base, "Add a profile URL or applications URL")
  end

  def portal_urls_are_secure
    %i[profile_url applications_url].each do |attribute|
      value = public_send(attribute)
      next if value.blank?

      uri = URI.parse(value)
      next if uri.is_a?(URI::HTTPS) && uri.host.present?

      errors.add(attribute, "must be a complete HTTPS URL")
    rescue URI::InvalidURIError
      errors.add(attribute, "must be a complete HTTPS URL")
    end
  end

  def normalize_values
    self.account_label = account_label.to_s.strip.presence
    self.profile_url = profile_url.to_s.strip.presence
    self.applications_url = applications_url.to_s.strip.presence
  end
end
