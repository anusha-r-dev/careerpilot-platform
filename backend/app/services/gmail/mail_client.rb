require "net/http"
require "json"

module Gmail
  class MailClient
    API_ROOT = "https://gmail.googleapis.com/gmail/v1/users/me"

    def initialize(access_token:)
      @access_token = access_token
    end

    def profile
      get_json(URI("#{API_ROOT}/profile"))
    end

    def message_ids(query:, max_results: 50)
      uri = URI("#{API_ROOT}/messages")
      uri.query = URI.encode_www_form(q: query, maxResults: max_results)
      get_json(uri).fetch("messages", []).map { |message| message.fetch("id") }
    end

    def message(message_id)
      encoded_id = ERB::Util.url_encode(message_id)
      uri = URI("#{API_ROOT}/messages/#{encoded_id}")
      uri.query = URI.encode_www_form(format: "full")
      get_json(uri)
    end

    private

    def get_json(uri)
      request = Net::HTTP::Get.new(uri)
      request["Authorization"] = "Bearer #{@access_token}"
      request["Accept"] = "application/json"
      response = Net::HTTP.start(
        uri.host,
        uri.port,
        use_ssl: true,
        open_timeout: 5,
        read_timeout: 20
      ) { |http| http.request(request) }
      body = JSON.parse(response.body)

      unless response.is_a?(Net::HTTPSuccess)
        message = body.dig("error", "message") || "Gmail API request failed."
        raise ApiError, message
      end

      body
    rescue JSON::ParserError
      raise ApiError, "Gmail returned an unreadable response."
    rescue Timeout::Error, SocketError, SystemCallError => error
      raise ApiError, "Gmail is temporarily unavailable: #{error.class}."
    end
  end
end
