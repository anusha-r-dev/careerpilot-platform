require "digest"

module Authentication
  extend ActiveSupport::Concern

  SESSION_COOKIE = :careerpilot_session
  SESSION_DURATION = 7.days

  attr_reader :current_user, :current_user_session

  private

  def authenticate_user!
    raw_token = cookies.encrypted[SESSION_COOKIE]
    session_record = find_active_session(raw_token)

    unless session_record&.user&.active?
      clear_session_cookie
      render json: { error: "Authentication is required." }, status: :unauthorized
      return
    end

    @current_user_session = session_record
    @current_user = session_record.user
  end

  def require_member!
    return if current_user&.member?

    render json: { error: "A member account is required." }, status: :forbidden
  end

  def require_admin!
    return if current_user&.admin?

    render json: { error: "Administrator access is required." }, status: :forbidden
  end

  def start_session_for(user)
    raw_token = SecureRandom.urlsafe_base64(32)
    expires_at = SESSION_DURATION.from_now

    user_session = user.user_sessions.create!(
      token_digest: token_digest(raw_token),
      expires_at: expires_at,
      ip_address: request.remote_ip,
      user_agent: request.user_agent
    )

    cookies.encrypted[SESSION_COOKIE] = {
      value: raw_token,
      expires: expires_at,
      httponly: true,
      same_site: :strict,
      secure: Rails.env.production?
    }

    user_session
  end

  def end_current_session
    current_user_session&.destroy!
    clear_session_cookie
  end

  def find_active_session(raw_token)
    return if raw_token.blank?

    UserSession.active.includes(:user).find_by(token_digest: token_digest(raw_token))
  end

  def token_digest(raw_token)
    Digest::SHA256.hexdigest(raw_token)
  end

  def clear_session_cookie
    cookies.delete(SESSION_COOKIE, same_site: :strict)
  end
end
