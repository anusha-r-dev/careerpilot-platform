require "test_helper"

module Api
  module V1
    module Admin
      class DashboardControllerTest < ActionDispatch::IntegrationTest
        setup do
          @source = create_test_source
          @admin = create_test_user(
            role: :admin,
            name: "Platform Admin",
            email: "platform-admin@example.com"
          )
          @member = create_test_user(
            role: :member,
            name: "Platform Member",
            email: "platform-member@example.com"
          )
          create_application_for(
            @member,
            source: @source,
            status: :offer
          )
        end

        test "administrator receives privacy-safe platform totals" do
          sign_in_as(@admin, portal: "admin")
          get "/api/v1/admin/dashboard"

          assert_response :success
          body = response.parsed_body
          assert_equal 1, body.dig("summary", "members")
          assert_equal 1, body.dig("summary", "applications")
          assert_equal 1, body.dig("summary", "offers")
          assert_equal @member.email, body.dig("members", 0, "email")
          assert_not body.key?("applications")
        end

        test "member cannot read the administrator overview" do
          sign_in_as(@member)
          get "/api/v1/admin/dashboard"

          assert_response :forbidden
        end
      end
    end
  end
end
