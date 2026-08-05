module Gmail
  class Synchronizer
    SEARCH_QUERY = 'newer_than:1y {"application received" "application submitted" "thank you for applying" interview "offer letter" "not moving forward"}'.freeze

    def initialize(
      connection,
      oauth_client: OauthClient.new,
      parser: ApplicationEmailParser.new,
      mail_client_factory: ->(token) { MailClient.new(access_token: token) }
    )
      @connection = connection
      @oauth_client = oauth_client
      @parser = parser
      @mail_client_factory = mail_client_factory
    end

    def call
      raise ConfigurationError, "Connect a real Gmail account before synchronizing." unless connection.real_connection?

      mail_client = mail_client_factory.call(fresh_access_token)
      message_ids = mail_client.message_ids(query: SEARCH_QUERY, max_results: 75)
      discovered = message_ids.count do |message_id|
        import_message(mail_client, message_id)
      end

      connection.update!(
        status: :active,
        last_synced_at: Time.current,
        last_error: nil
      )

      { scanned: message_ids.size, discovered: discovered }
    rescue Gmail::Error => error
      connection.update_columns(last_error: error.message, updated_at: Time.current)
      raise
    end

    private

    attr_reader :connection, :oauth_client, :parser, :mail_client_factory

    def fresh_access_token
      current_token = connection.access_token
      expires_soon = connection.token_expires_at.blank? ||
        connection.token_expires_at <= 5.minutes.from_now
      return current_token if current_token.present? && !expires_soon

      token_data = oauth_client.refresh(connection.refresh_token)
      connection.access_token = token_data.fetch("access_token")
      connection.token_expires_at = token_data.fetch("expires_in", 3600).seconds.from_now
      connection.scope = token_data["scope"] if token_data["scope"].present?
      connection.save!
      connection.access_token
    rescue KeyError
      connection.update!(status: :needs_reconnect)
      raise ApiError, "Google did not return a usable access token. Reconnect Gmail."
    end

    def import_message(mail_client, message_id)
      return false if connection.email_imports.exists?(provider_message_id: message_id)

      attributes = parser.parse(mail_client.message(message_id))
      return false if attributes.blank?

      connection.email_imports.create!(attributes.merge(user: connection.user))
      true
    end
  end
end
