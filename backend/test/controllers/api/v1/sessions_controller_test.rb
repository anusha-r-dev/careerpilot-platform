require "test_helper"

module Api
  module V1
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @member = create_test_user(
          role: :member,
          name: "Test Member",
          email: "member-session@example.com"
        )
      end

      test "member signs in and reads the current session" do
        sign_in_as(@member, portal: "member")
        get "/api/v1/session"

        assert_response :success
        assert_equal @member.id, response.parsed_body.dig("user", "id")
        assert_equal "member", response.parsed_body.dig("user", "role")
        assert_equal 1, @member.user_sessions.count
      end

      test "member cannot use the administrator portal" do
        post "/api/v1/session",
          params: {
            session: {
              email: @member.email,
              password: AuthenticationTestHelper::TEST_PASSWORD,
              portal: "admin"
            }
          },
          as: :json

        assert_response :forbidden
        assert_equal 0, @member.user_sessions.count
      end

      test "logout removes the database session" do
        sign_in_as(@member)

        assert_difference("UserSession.count", -1) do
          delete "/api/v1/session"
        end

        assert_response :no_content
      end
    end
  end
end
