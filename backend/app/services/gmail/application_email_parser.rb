require "base64"
require "cgi"

module Gmail
  class ApplicationEmailParser
    STATUS_PATTERNS = {
      rejected: /(?:not moving forward|not selected|other candidates|regret to inform|application was unsuccessful|unfortunately)/i,
      offer: /(?:offer of employment|job offer|pleased to offer|offer letter)/i,
      interview: /(?:interview|phone screen|technical round|schedule (?:a|your) call)/i,
      applied: /(?:application (?:received|submitted)|thank you for applying|we received your application|successfully applied)/i
    }.freeze

    SOURCE_PATTERNS = {
      "LinkedIn" => /linkedin/i,
      "Indeed" => /indeed/i,
      "Naukri" => /naukri/i,
      "Wellfound" => /wellfound|angel\.co/i,
      "Glassdoor" => /glassdoor/i
    }.freeze

    IGNORED_DOMAINS = %w[
      gmail google linkedin indeed naukri glassdoor wellfound greenhouse
      lever workday smartrecruiters icims taleo mail email noreply
    ].freeze

    def parse(message)
      headers = header_map(message)
      subject = headers.fetch("subject", "").strip
      sender = headers.fetch("from", "").strip
      body = normalized_body(message)
      searchable = [ subject, sender, message["snippet"], body ].compact.join(" ")
      inferred_status = detect_status(searchable)
      return if inferred_status.blank?

      company = extract_company(subject, sender, body)
      title = extract_title(subject, body)
      source_name = detect_source(searchable)
      url = extract_job_url(body) || gmail_message_url(message.fetch("id"))
      confidence = confidence_for(company: company, title: title, source_name: source_name)

      {
        provider_message_id: message.fetch("id"),
        sender: sender.presence,
        subject: subject.presence || "Recruiting email",
        received_at: received_at(message, headers),
        company: company || "Company to review",
        title: title || "Role to review",
        job_url: url,
        source_name: source_name,
        inferred_status: inferred_status,
        confidence: confidence,
        snippet: clean_text(message["snippet"].presence || body).truncate(280),
        detected_at: Time.current
      }
    end

    private

    def header_map(message)
      message.dig("payload", "headers").to_a.each_with_object({}) do |header, result|
        result[header.fetch("name", "").downcase] = header["value"].to_s
      end
    end

    def normalized_body(message)
      clean_text(extract_parts(message["payload"]))
    end

    def extract_parts(part)
      return "" if part.blank?

      own_body = decode(part.dig("body", "data"))
      child_bodies = part.fetch("parts", []).map { |child| extract_parts(child) }
      [ own_body, *child_bodies ].reject(&:blank?).join(" ")
    end

    def decode(data)
      return "" if data.blank?

      padding = "=" * ((4 - data.length % 4) % 4)
      Base64.urlsafe_decode64(data + padding)
    rescue ArgumentError
      ""
    end

    def clean_text(text)
      plain = ActionView::Base.full_sanitizer.sanitize(CGI.unescapeHTML(text.to_s))
      plain.gsub(/\s+/, " ").strip
    end

    def detect_status(text)
      STATUS_PATTERNS.each do |status, pattern|
        return status if text.match?(pattern)
      end
      nil
    end

    def extract_company(subject, sender, body)
      candidates = [
        subject[/application to (.+?) (?:was|has|is)(?:\s|$)/i, 1],
        subject[/thank you for applying to (.+?)(?:[|–—-]|$)/i, 1],
        subject[/(?:interview|conversation) (?:with|at) (.+?)(?:[|–—-]|$)/i, 1],
        subject[/(?:offer) (?:from|at) (.+?)(?:[|–—-]|$)/i, 1],
        subject[/\s+at\s+(.+?)(?:[|–—-]|$)/i, 1],
        body[/thank you for (?:your interest in|applying to)\s+([A-Z][\w&.' ]{2,50})/i, 1]
      ]
      explicit = candidates.compact.map(&:strip).find(&:present?)
      return explicit.truncate(120) if explicit.present?

      company_from_sender(sender)
    end

    def company_from_sender(sender)
      domain = sender[/@([a-z0-9.-]+)/i, 1]
      return if domain.blank?

      label = domain.split(".").reverse.find do |part|
        part.length > 2 && !IGNORED_DOMAINS.include?(part.downcase)
      end
      label&.tr("-_", " ")&.titleize
    end

    def extract_title(subject, body)
      candidates = [
        subject[/(?:application|interview|offer)(?: received| submitted| invitation)?(?: for)?\s*[-:]?\s*(.+?)\s+(?:at|with)\s+/i, 1],
        subject[/for the (.+?) (?:role|position)/i, 1],
        body[/application for (?:the )?([A-Z][\w+\/#&,.()' -]{2,100}?) (?:role|position|at)/i, 1]
      ]
      candidates.compact.map(&:strip).find(&:present?)&.truncate(120)
    end

    def detect_source(text)
      SOURCE_PATTERNS.each do |name, pattern|
        return name if text.match?(pattern)
      end
      "Company careers"
    end

    def extract_job_url(body)
      urls = CGI.unescapeHTML(body.to_s).scan(%r{https?://[^\s<>"']+}i)
      urls.map { |url| url.delete_suffix(".").delete_suffix(")") }.find do |url|
        url.match?(/jobs?|careers?|linkedin|indeed|naukri|wellfound|glassdoor|greenhouse|lever|workday/i) &&
          !url.match?(/unsubscribe|preferences|tracking|pixel/i)
      end
    end

    def gmail_message_url(message_id)
      "https://mail.google.com/mail/u/0/#all/#{ERB::Util.url_encode(message_id)}"
    end

    def received_at(message, headers)
      internal_date = message["internalDate"].to_i
      return Time.at(internal_date / 1000.0).in_time_zone if internal_date.positive?

      Time.zone.parse(headers["date"].to_s) || Time.current
    rescue ArgumentError, TypeError
      Time.current
    end

    def confidence_for(company:, title:, source_name:)
      score = 45
      score += 20 if company.present?
      score += 20 if title.present?
      score += 10 if source_name != "Company careers"
      score.clamp(0, 95)
    end
  end
end
