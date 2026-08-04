require "net/http"
require "json"

module Gmail
  class OauthClient
    AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

    def authorization_url(state:)
      Configuration.ensure_configured!

      uri = URI(AUTHORIZATION_ENDPOINT)
      uri.query = URI.encode_www_form(
        client_id: Configuration.client_id,
        redirect_uri: Configuration.redirect_uri,
        response_type: "code",
        scope: Configuration::SCOPE,
        access_type: "offline",
        include_granted_scopes: "true",
        prompt: "consent",
        state: state
      )
      uri.to_s
    end

    def exchange_code(code)
      Configuration.ensure_configured!
      post_token(
        code: code,
        client_id: Configuration.client_id,
        client_secret: Configuration.client_secret,
        redirect_uri: Configuration.redirect_uri,
        grant_type: "authorization_code"
      )
    end

    def refresh(refresh_token)
      Configuration.ensure_configured!
      post_token(
        refresh_token: refresh_token,
        client_id: Configuration.client_id,
        client_secret: Configuration.client_secret,
        grant_type: "refresh_token"
      )
    end

    private

    def post_token(parameters)
      uri = URI(TOKEN_ENDPOINT)
      request = Net::HTTP::Post.new(uri)
      request.set_form_data(parameters)
      response = perform(uri, request)
      body = JSON.parse(response.body)

      unless response.is_a?(Net::HTTPSuccess)
        raise ApiError, body["error_description"] || "Google rejected the OAuth request."
      end

      body
    rescue JSON::ParserError
      raise ApiError, "Google returned an unreadable OAuth response."
    end

    def perform(uri, request)
      Net::HTTP.start(
        uri.host,
        uri.port,
        use_ssl: true,
        open_timeout: 5,
        read_timeout: 15
      ) { |http| http.request(request) }
    rescue Timeout::Error, SocketError, SystemCallError => error
      raise ApiError, "Google OAuth is temporarily unavailable: #{error.class}."
    end
  end
end
