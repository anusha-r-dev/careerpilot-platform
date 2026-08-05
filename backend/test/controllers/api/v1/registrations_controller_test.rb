require "test_helper"

module Api
  module V1
    class RegistrationsControllerTest < ActionDispatch::IntegrationTest
      test "creates a private member account and starts a session" do
        assert_difference([ "User.count", "UserSession.count" ], 1) do
          post "/api/v1/registration",
            params: {
              registration: {
                name: "New Member",
                email: "new-member@example.com",
                password: "CareerPilotMember123!",
                password_confirmation: "CareerPilotMember123!",
                headline: "QA Engineer",
                location: "Pune, India",
                role: "admin"
              }
            },
            as: :json
        end

        assert_response :created
        assert_equal "member", response.parsed_body.dig("user", "role")
        assert_equal "new-member@example.com", response.parsed_body.dig("user", "email")
      end

      test "rejects duplicate email addresses" do
        create_test_user(
          role: :member,
          name: "Existing Member",
          email: "existing@example.com"
        )

        assert_no_difference("User.count") do
          post "/api/v1/registration",
            params: {
              registration: {
                name: "Duplicate Member",
                email: "existing@example.com",
                password: "CareerPilotMember123!",
                password_confirmation: "CareerPilotMember123!"
              }
            },
            as: :json
        end

        assert_response :unprocessable_entity
      end
    end
  end
end
