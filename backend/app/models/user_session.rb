class UserSession < ApplicationRecord
  belongs_to :user

  validates :token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }
end
