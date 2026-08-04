require "test_helper"
require "base64"

module Gmail
  class ApplicationEmailParserTest < ActiveSupport::TestCase
    test "extracts an applied job from a Gmail message without storing its body" do
      body = "Thank you for applying. View the job at https://jobs.example.com/frontend-engineer"
      message = {
        "id" => "gmail-message-1",
        "internalDate" => (Time.zone.parse("2026-08-03 10:00").to_f * 1000).to_i.to_s,
        "snippet" => "Thank you for applying to Acme.",
        "payload" => {
          "headers" => [
            { "name" => "Subject", "value" => "Application submitted: Frontend Engineer at Acme" },
            { "name" => "From", "value" => "Acme Careers <jobs@acme.com>" }
          ],
          "body" => { "data" => Base64.urlsafe_encode64(body, padding: false) }
        }
      }

      result = ApplicationEmailParser.new.parse(message)

      assert_equal :applied, result[:inferred_status]
      assert_equal "Acme", result[:company]
      assert_equal "Frontend Engineer", result[:title]
      assert_equal "https://jobs.example.com/frontend-engineer", result[:job_url]
      assert_operator result[:confidence], :>=, 80
      refute result.key?(:raw_body)
    end

    test "ignores messages without a recruiting status signal" do
      message = {
        "id" => "ordinary-message",
        "snippet" => "Your weekly newsletter is ready.",
        "payload" => {
          "headers" => [
            { "name" => "Subject", "value" => "Weekly engineering newsletter" }
          ],
          "body" => {}
        }
      }

      assert_nil ApplicationEmailParser.new.parse(message)
    end
  end
end
