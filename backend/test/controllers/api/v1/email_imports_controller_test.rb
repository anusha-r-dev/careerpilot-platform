require "test_helper"

module Api
  module V1
    class EmailImportsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @member = create_test_user(
          role: :member,
          name: "Import Member",
          email: "import-member@example.com"
        )
        @other_member = create_test_user(
          role: :member,
          name: "Other Import Member",
          email: "other-import-member@example.com"
        )
        @source = create_test_source
        @connection = @member.mailbox_connections.create!(
          provider: :gmail,
          email: @member.email,
          demo: true
        )
      end

      test "member confirms an email into their private pipeline" do
        email_import = create_email_import(@member, @connection)
        sign_in_as(@member)

        assert_difference("JobApplication.count", 1) do
          post "/api/v1/email_imports/#{email_import.id}/confirm",
            params: {
              email_import: {
                company: "Confirmed Company",
                title: "Confirmed Engineer",
                source_name: @source.name,
                status: "applied"
              }
            },
            as: :json
        end

        assert_response :success
        application = JobApplication.last
        assert_equal @member.id, application.user_id
        assert_equal "Confirmed Company", application.company
        assert_predicate email_import.reload, :imported?
      end

      test "member cannot review another member's email" do
        other_connection = @other_member.mailbox_connections.create!(
          provider: :gmail,
          email: @other_member.email,
          demo: true
        )
        private_import = create_email_import(@other_member, other_connection)
        sign_in_as(@member)

        patch "/api/v1/email_imports/#{private_import.id}/ignore", as: :json

        assert_response :not_found
        assert_predicate private_import.reload, :pending?
      end

      test "email import index exposes only pending records" do
        pending_import = create_email_import(@member, @connection)
        ignored_import = create_email_import(
          @member,
          @connection,
          message_id: "ignored-message",
          state: :ignored
        )
        sign_in_as(@member)

        get "/api/v1/email_imports", as: :json

        assert_response :success
        ids = response.parsed_body.fetch("imports").pluck("id")
        assert_includes ids, pending_import.id
        refute_includes ids, ignored_import.id
      end

      private

      def create_email_import(user, connection, message_id: "message-1", state: :pending)
        connection.email_imports.create!(
          user: user,
          provider_message_id: message_id,
          sender: "Recruiting <jobs@example.com>",
          subject: "Application received: Engineer at Example",
          received_at: Time.current,
          company: "Example",
          title: "Engineer",
          job_url: "https://example.com/jobs/#{message_id}",
          source_name: "LinkedIn",
          inferred_status: :applied,
          confidence: 90,
          snippet: "Thank you for applying.",
          state: state,
          detected_at: Time.current
        )
      end
    end
  end
end
