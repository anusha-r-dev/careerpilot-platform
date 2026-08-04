module Api
  module V1
    class InterviewsController < ApplicationController
      include Authentication
      include ApiRendering

      before_action :authenticate_user!
      before_action :require_member!

      def create
        application = current_user.job_applications.find(interview_params[:job_application_id])
        interview = application.interviews.build(
          interview_params.except(:job_application_id)
        )

        if interview.save
          application.update!(status: :interview)
          render json: { interview: serialize_interview(interview) }, status: :created
        else
          render json: { errors: interview.errors.full_messages },
            status: :unprocessable_entity
        end
      end

      private

      def interview_params
        params.require(:interview).permit(
          :job_application_id,
          :starts_at,
          :interview_type,
          :duration_minutes,
          :contact_name,
          :meeting_url,
          :notes
        )
      end
    end
  end
end
