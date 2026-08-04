require "test_helper"

module Gmail
  class SynchronizerTest < ActiveSupport::TestCase
    class FakeMailClient
      attr_reader :requested_messages

      def initialize
        @requested_messages = []
      end

      def message_ids(query:, max_results:)
        raise "query missing" if query.blank? || max_results <= 0

        %w[gmail-1]
      end

      def message(message_id)
        requested_messages << message_id
        { "id" => message_id }
      end
    end

    class FakeParser
      def parse(message)
        {
          provider_message_id: message.fetch("id"),
          sender: "Recruiting <jobs@example.com>",
          subject: "Application submitted: Engineer at Example",
          received_at: Time.current,
          company: "Example",
          title: "Engineer",
          job_url: "https://example.com/jobs/engineer",
          source_name: "Company careers",
          inferred_status: :applied,
          confidence: 90,
          snippet: "Thank you for applying.",
          detected_at: Time.current
        }
      end
    end

    test "synchronizes a message once and keeps it private to the connection owner" do
      user = User.create!(
        name: "Sync Member",
        email: "sync-member@example.com",
        role: :member,
        password: "CareerPilotTest123!",
        password_confirmation: "CareerPilotTest123!"
      )
      connection = user.mailbox_connections.create!(
        provider: :gmail,
        email: user.email,
        access_token: "current-access-token",
        refresh_token: "refresh-token",
        token_expires_at: 1.hour.from_now,
        demo: false
      )
      mail_client = FakeMailClient.new
      synchronizer = Synchronizer.new(
        connection,
        parser: FakeParser.new,
        mail_client_factory: ->(_token) { mail_client }
      )

      assert_difference("EmailImport.count", 1) do
        result = synchronizer.call
        assert_equal({ scanned: 1, discovered: 1 }, result)
      end

      email_import = EmailImport.last
      assert_equal user.id, email_import.user_id
      assert_equal connection.id, email_import.mailbox_connection_id
      assert_predicate email_import, :pending?

      assert_no_difference("EmailImport.count") do
        result = synchronizer.call
        assert_equal({ scanned: 1, discovered: 0 }, result)
      end
      assert_equal [ "gmail-1" ], mail_client.requested_messages
    end
  end
end
