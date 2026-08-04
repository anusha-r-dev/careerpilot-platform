module Api
  module V1
    module Admin
      class DashboardsController < ApplicationController
        include Authentication
        include ApiRendering

        before_action :authenticate_user!
        before_action :require_admin!

        def show
          members = User.member
            .includes(:job_applications)
            .order(:name)
            .to_a
          applications = JobApplication.all.to_a

          render json: {
            viewer: serialize_user(current_user),
            summary: {
              members: members.size,
              active_members: members.count(&:active?),
              applications: applications.size,
              interviews: applications.count(&:interview?),
              offers: applications.count(&:offer?),
              sources: JobSource.active.count
            },
            status_counts: JobApplication.statuses.keys.index_with do |status|
              applications.count { |application| application.status == status }
            end,
            members: members.map { |member| serialize_user(member, include_counts: true) },
            sources: JobSource.order(:name).map { |source| serialize_source(source) }
          }
        end
      end
    end
  end
end
