ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    parallelize(workers: :number_of_processors)
    fixtures :all
  end
end

module AuthenticationTestHelper
  TEST_PASSWORD = "CareerPilotTest123!"

  def create_test_user(role:, name:, email:)
    User.create!(
      name: name,
      email: email,
      role: role,
      password: TEST_PASSWORD,
      password_confirmation: TEST_PASSWORD
    )
  end

  def sign_in_as(user, portal: user.role)
    post "/api/v1/session",
      params: {
        session: {
          email: user.email,
          password: TEST_PASSWORD,
          portal: portal
        }
      },
      as: :json

    assert_response :created
  end

  def create_test_source(name: "LinkedIn", remote_focused: false)
    JobSource.create!(
      name: name,
      home_url: "https://example.com/#{name.parameterize}",
      search_url: "https://example.com/#{name.parameterize}/jobs",
      accent: "blue",
      remote_focused: remote_focused
    )
  end

  def create_application_for(user, source:, title: "Software Engineer", status: :saved)
    JobApplication.create!(
      user: user,
      job_source: source,
      company: "Example Company",
      title: title,
      job_url: "https://example.com/jobs/#{user.id}-#{title.parameterize}",
      status: status
    )
  end
end

ActionDispatch::IntegrationTest.include AuthenticationTestHelper
