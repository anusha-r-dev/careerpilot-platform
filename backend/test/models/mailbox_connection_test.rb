require "test_helper"

class MailboxConnectionTest < ActiveSupport::TestCase
  test "encrypts OAuth tokens before persistence" do
    user = User.create!(
      role: :member,
      name: "Token Member",
      email: "token-member@example.com",
      password: "CareerPilotTest123!",
      password_confirmation: "CareerPilotTest123!"
    )
    connection = user.mailbox_connections.create!(
      provider: :gmail,
      email: user.email,
      access_token: "access-secret",
      refresh_token: "refresh-secret"
    )

    refute_includes connection.access_token_ciphertext, "access-secret"
    refute_includes connection.refresh_token_ciphertext, "refresh-secret"
    assert_equal "access-secret", connection.reload.access_token
    assert_equal "refresh-secret", connection.refresh_token
  end
end
