require "test_helper"

module Api
  module V1
    class PortalProfilesControllerTest < ActionDispatch::IntegrationTest
      setup do
        @source = create_test_source(remote_focused: true)
        @member = create_test_user(
          role: :member,
          name: "Portal Member",
          email: "portal-member@example.com"
        )
        @other_member = create_test_user(
          role: :member,
          name: "Other Portal Member",
          email: "other-portal-member@example.com"
        )
      end

      test "member links a job portal without sharing credentials" do
        sign_in_as(@member)

        assert_difference("JobPortalProfile.count", 1) do
          post "/api/v1/portal_profiles",
            params: {
              portal_profile: {
                job_source_id: @source.id,
                account_label: "Personal account",
                profile_url: "https://example.com/profile",
                applications_url: "https://example.com/applications"
              }
            },
            as: :json
        end

        assert_response :created
        assert_equal @member.id, JobPortalProfile.last.user_id
      end

      test "portal index reports only the signed-in member application counts" do
        @member.job_portal_profiles.create!(
          job_source: @source,
          applications_url: "https://example.com/applications"
        )
        create_application_for(@member, source: @source, status: :interview)
        create_application_for(
          @other_member,
          source: @source,
          title: "Private Application",
          status: :offer
        )
        sign_in_as(@member)

        get "/api/v1/portal_profiles", as: :json

        assert_response :success
        portal = response.parsed_body.fetch("portals").find do |item|
          item.dig("source", "id") == @source.id
        end
        assert_equal 1, portal.fetch("application_count")
        assert_equal 1, portal.dig("status_counts", "interview")
        assert_equal 0, portal.dig("status_counts", "offer")
        assert_equal true, portal.dig("source", "remote_focused")
      end

      test "member cannot update another member portal profile" do
        private_profile = @other_member.job_portal_profiles.create!(
          job_source: @source,
          profile_url: "https://example.com/private-profile"
        )
        sign_in_as(@member)

        patch "/api/v1/portal_profiles/#{private_profile.id}",
          params: {
            portal_profile: { account_label: "Changed by another member" }
          },
          as: :json

        assert_response :not_found
        assert_nil private_profile.reload.account_label
      end

      test "member records a portal visit and can disconnect it" do
        profile = @member.job_portal_profiles.create!(
          job_source: @source,
          profile_url: "https://example.com/member-profile"
        )
        sign_in_as(@member)

        patch "/api/v1/portal_profiles/#{profile.id}/opened", as: :json
        assert_response :success
        assert_not_nil profile.reload.last_opened_at

        assert_difference("JobPortalProfile.count", -1) do
          delete "/api/v1/portal_profiles/#{profile.id}", as: :json
        end
        assert_response :no_content
      end
    end
  end
end
