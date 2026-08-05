require "test_helper"

class JobApplicationTest < ActiveSupport::TestCase
  setup do
    @user = User.create!(
      name: "Model Member",
      email: "model-member@example.com",
      password: "CareerPilotTest123!",
      role: :member
    )
    @source = JobSource.create!(
      name: "Model Source",
      home_url: "https://example.com",
      search_url: "https://example.com/jobs",
      accent: "orange"
    )
  end

  test "requires a valid job URL" do
    application = JobApplication.new(
      user: @user,
      job_source: @source,
      company: "Example",
      title: "Developer",
      job_url: "not-a-url"
    )

    assert_not application.valid?
    assert_includes application.errors[:job_url], "is invalid"
  end

  test "prevents a user from saving the same URL twice" do
    attributes = {
      user: @user,
      job_source: @source,
      company: "Example",
      title: "Developer",
      job_url: "https://example.com/jobs/123"
    }
    JobApplication.create!(attributes)

    duplicate = JobApplication.new(attributes)
    assert_not duplicate.valid?
  end

  test "records applied date when moving into the active process" do
    application = JobApplication.create!(
      user: @user,
      job_source: @source,
      company: "Example",
      title: "Developer",
      job_url: "https://example.com/jobs/456",
      status: :applied
    )

    assert_equal Time.zone.today, application.applied_on
  end
end
