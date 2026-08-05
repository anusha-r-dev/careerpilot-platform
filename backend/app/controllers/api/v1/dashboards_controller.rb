module Api
  module V1
    class DashboardsController < ApplicationController
      include Authentication
      include ApiRendering

      before_action :authenticate_user!
      before_action :require_member!

      def show
        applications = current_user.job_applications
          .includes(:job_source, :interviews)
          .order(updated_at: :desc)
          .to_a
        upcoming_interviews = current_user.interviews.upcoming.limit(5)

        render json: {
          viewer: serialize_user(current_user),
          summary: summary_for(applications),
          status_counts: JobApplication.statuses.keys.index_with do |status|
            applications.count { |application| application.status == status }
          end,
          sources: JobSource.active.order(:name).map { |source| serialize_source(source) },
          applications: applications.map { |application| serialize_application(application) },
          upcoming_interviews: upcoming_interviews.map do |interview|
            serialize_interview(interview).merge(
              company: interview.job_application.company,
              title: interview.job_application.title
            )
          end
        }
      end

      private

      def summary_for(applications)
        {
          total: applications.size,
          active: applications.count { |application| !application.rejected? && !application.withdrawn? },
          applied: applications.count(&:applied?),
          interviews: applications.count(&:interview?),
          offers: applications.count(&:offer?),
          actions_due: applications.count do |application|
            application.next_action_on.present? &&
              application.next_action_on <= Time.zone.today &&
              !application.rejected? &&
              !application.withdrawn?
          end
        }
      end
    end
  end
end
