module Gmail
  module Configuration
    module_function

    SCOPE = "openid email https://www.googleapis.com/auth/gmail.readonly"

    def client_id
      ENV["GOOGLE_CLIENT_ID"].presence ||
        Rails.application.credentials.dig(:google, :client_id)
    end

    def client_secret
      ENV["GOOGLE_CLIENT_SECRET"].presence ||
        Rails.application.credentials.dig(:google, :client_secret)
    end

    def redirect_uri
      ENV.fetch(
        "GOOGLE_REDIRECT_URI",
        "http://127.0.0.1:3000/api/v1/integrations/gmail/callback"
      )
    end

    def frontend_url
      ENV["CAREERPILOT_FRONTEND_URL"].presence || render_frontend_url ||
        "http://127.0.0.1:5173"
    end

    def render_frontend_url
      hostname = ENV["RENDER_EXTERNAL_HOSTNAME"].presence
      "https://#{hostname}" if hostname
    end

    def configured?
      client_id.present? && client_secret.present?
    end

    def ensure_configured!
      return if configured?

      raise ConfigurationError,
        "Gmail OAuth is not configured. Add the Google client ID and secret."
    end
  end
end
