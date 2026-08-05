require "test_helper"

module Api
  module V1
    class ApplicationsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @source = create_test_source
        @member = create_test_user(
          role: :member,
          name: "Applications Member",
          email: "applications-member@example.com"
        )
        @other_member = create_test_user(
          role: :member,
          name: "Other Applications Member",
          email: "other-applications-member@example.com"
        )
      end

      test "member saves an external job URL" do
        sign_in_as(@member)

        assert_difference("JobApplication.count", 1) do
          post "/api/v1/applications",
            params: {
              application: {
                job_source_id: @source.id,
                company: "Acme",
                title: "Frontend Engineer",
                job_url: "https://example.com/jobs/frontend",
                status: "saved"
              }
            },
            as: :json
        end

        assert_response :created
        assert_equal @member.id, JobApplication.last.user_id
      end

      test "member advances an application status" do
        application = create_application_for(@member, source: @source)
        sign_in_as(@member)

        patch "/api/v1/applications/#{application.id}",
          params: { application: { status: "applied" } },
          as: :json

        assert_response :success
        assert_equal "applied", response.parsed_body.dig("application", "status")
        assert_equal Time.zone.today, application.reload.applied_on
      end

      test "member cannot update another person's application" do
        private_application = create_application_for(
          @other_member,
          source: @source,
          title: "Private Role"
        )
        sign_in_as(@member)

        patch "/api/v1/applications/#{private_application.id}",
          params: { application: { status: "offer" } },
          as: :json

        assert_response :not_found
        assert_predicate private_application.reload, :saved?
      end

      test "unauthenticated user cannot save a job" do
        post "/api/v1/applications",
          params: {
            application: {
              company: "Acme",
              title: "Developer",
              job_url: "https://example.com/jobs/unauthorized"
            }
          },
          as: :json

        assert_response :unauthorized
      end
    end
  end
end
