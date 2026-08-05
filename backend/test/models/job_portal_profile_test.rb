require "test_helper"

class JobPortalProfileTest < ActiveSupport::TestCase
  include AuthenticationTestHelper

  setup do
    @member = create_test_user(
      role: :member,
      name: "Portal Member",
      email: "portal-model@example.com"
    )
    @source = create_test_source
  end

  test "accepts secure portal URLs" do
    profile = @member.job_portal_profiles.build(
      job_source: @source,
      profile_url: "https://www.linkedin.com/in/example",
      applications_url: "https://www.linkedin.com/my-items/saved-jobs/"
    )

    assert_predicate profile, :valid?
  end

  test "rejects missing and unsafe portal URLs" do
    missing_profile = @member.job_portal_profiles.build(job_source: @source)
    unsafe_profile = @member.job_portal_profiles.build(
      job_source: @source,
      profile_url: "javascript:alert(1)"
    )

    assert_not_predicate missing_profile, :valid?
    assert_includes missing_profile.errors.full_messages,
      "Add a profile URL or applications URL"
    assert_not_predicate unsafe_profile, :valid?
    assert_includes unsafe_profile.errors[:profile_url],
      "must be a complete HTTPS URL"
  end

  test "allows one portal profile per source and member" do
    @member.job_portal_profiles.create!(
      job_source: @source,
      profile_url: "https://example.com/member"
    )
    duplicate = @member.job_portal_profiles.build(
      job_source: @source,
      applications_url: "https://example.com/applications"
    )

    assert_not_predicate duplicate, :valid?
    assert_includes duplicate.errors[:job_source_id], "has already been taken"
  end
end
