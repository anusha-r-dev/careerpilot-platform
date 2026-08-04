module Api
  module V1
    class PortalProfilesController < ApplicationController
      include Authentication
      include ApiRendering

      before_action :authenticate_user!
      before_action :require_member!
      before_action :set_profile, only: %i[update destroy opened]

      def index
        sources = JobSource.active.order(:name)
        profiles = current_user.job_portal_profiles
          .includes(:job_source)
          .index_by(&:job_source_id)
        applications = current_user.job_applications
          .where(job_source_id: sources.select(:id))
          .to_a
          .group_by(&:job_source_id)

        render json: {
          portals: sources.map do |source|
            source_applications = applications.fetch(source.id, [])
            {
              source: serialize_source(source),
              profile: serialize_portal_profile(profiles[source.id]),
              application_count: source_applications.length,
              status_counts: portal_status_counts(source_applications)
            }
          end
        }
      end

      def create
        source = JobSource.active.find(portal_profile_params.fetch(:job_source_id))
        profile = current_user.job_portal_profiles.build(
          portal_profile_params.merge(job_source: source)
        )

        if profile.save
          render json: { profile: serialize_portal_profile(profile) },
            status: :created
        else
          render_errors(profile)
        end
      end

      def update
        if @profile.update(portal_profile_params.except(:job_source_id))
          render json: { profile: serialize_portal_profile(@profile) }
        else
          render_errors(@profile)
        end
      end

      def destroy
        @profile.destroy!
        head :no_content
      end

      def opened
        @profile.update!(last_opened_at: Time.current)
        render json: { profile: serialize_portal_profile(@profile) }
      end

      private

      def set_profile
        @profile = current_user.job_portal_profiles.find(params[:id])
      end

      def portal_profile_params
        params.require(:portal_profile).permit(
          :job_source_id,
          :account_label,
          :profile_url,
          :applications_url
        )
      end

      def portal_status_counts(applications)
        counts = JobApplication.statuses.keys.index_with { 0 }
        applications.each { |application| counts[application.status] += 1 }
        counts
      end

      def render_errors(profile)
        render json: { errors: profile.errors.full_messages },
          status: :unprocessable_entity
      end
    end
  end
end
