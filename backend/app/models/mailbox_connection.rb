class MailboxConnection < ApplicationRecord
  belongs_to :user
  has_many :email_imports, dependent: :destroy

  enum :provider, { gmail: 0 }, default: :gmail
  enum :status, {
    active: 0,
    needs_reconnect: 1,
    disconnected: 2
  }, default: :active

  validates :email,
    presence: true,
    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :provider, :status, presence: true
  validates :provider, uniqueness: { scope: :user_id }

  def access_token=(value)
    self.access_token_ciphertext = encrypt_token(value)
  end

  def access_token
    decrypt_token(access_token_ciphertext)
  end

  def refresh_token=(value)
    self.refresh_token_ciphertext = encrypt_token(value)
  end

  def refresh_token
    decrypt_token(refresh_token_ciphertext)
  end

  def real_connection?
    active? && !demo? && refresh_token.present?
  end

  def disconnect!
    update!(
      status: :disconnected,
      access_token_ciphertext: nil,
      refresh_token_ciphertext: nil,
      token_expires_at: nil,
      last_error: nil
    )
  end

  private

  def encrypt_token(value)
    return if value.blank?

    self.class.token_encryptor.encrypt_and_sign(value)
  end

  def decrypt_token(value)
    return if value.blank?

    self.class.token_encryptor.decrypt_and_verify(value)
  rescue ActiveSupport::MessageEncryptor::InvalidMessage
    nil
  end

  def self.token_encryptor
    @token_encryptor ||= begin
      key = ActiveSupport::KeyGenerator
        .new(Rails.application.secret_key_base)
        .generate_key("careerpilot-mailbox-token", 32)
      ActiveSupport::MessageEncryptor.new(key)
    end
  end
end
