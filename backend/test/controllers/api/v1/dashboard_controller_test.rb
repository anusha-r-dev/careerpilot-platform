require "test_helper"

module Api
  module V1
    class DashboardControllerTest < ActionDispatch::IntegrationTest
      setup do
        @source = create_test_source
        @member = create_test_user(
          role: :member,
          name: "Dashboard Member",
          email: "dashboard-member@example.com"
        )
        @other_member = create_test_user(
          role: :member,
          name: "Private Member",
          email: "private-member@example.com"
        )
        @application = create_application_for(
          @member,
          source: @source,
          status: :interview
        )
        create_application_for(
          @other_member,
          source: @source,
          title: "Private Analyst Role"
        )
      end

      test "member dashboard contains only the member's applications" do
        sign_in_as(@member)
        get "/api/v1/dashboard"

        assert_response :success
        body = response.parsed_body
        assert_equal @member.id, body.dig("viewer", "id")
        assert_equal [ @application.id ], body.fetch("applications").pluck("id")
        assert_equal 1, body.dig("summary", "interviews")
      end

      test "administrator cannot open a private member dashboard" do
        admin = create_test_user(
          role: :admin,
          name: "Dashboard Admin",
          email: "dashboard-admin@example.com"
        )
        sign_in_as(admin, portal: "admin")
        get "/api/v1/dashboard"

        assert_response :forbidden
      end
    end
  end
end
