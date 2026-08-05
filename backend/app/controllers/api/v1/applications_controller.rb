module Api
  module V1
    class ApplicationsController < ApplicationController
      include Authentication
      include ApiRendering

      before_action :authenticate_user!
      before_action :require_member!
      before_action :set_application, only: %i[update destroy]

      def index
        applications = current_user.job_applications
          .includes(:job_source, :interviews)
          .order(updated_at: :desc)

        render json: {
          applications: applications.map { |application| serialize_application(application) }
        }
      end

      def create
        application = current_user.job_applications.build(application_params)

        if application.save
          render json: { application: serialize_application(application) },
            status: :created
        else
          render_errors(application)
        end
      end

      def update
        if @application.update(application_params)
          render json: { application: serialize_application(@application) }
        else
          render_errors(@application)
        end
      end

      def destroy
        @application.destroy!
        head :no_content
      end

      private

      def set_application
        @application = current_user.job_applications
          .includes(:job_source, :interviews)
          .find(params[:id])
      end

      def application_params
        params.require(:application).permit(
          :job_source_id,
          :company,
          :title,
          :location,
          :employment_type,
          :job_url,
          :status,
          :notes,
          :applied_on,
          :next_action_on,
          :salary_note,
          :remote
        )
      end

      def render_errors(application)
        render json: { errors: application.errors.full_messages },
          status: :unprocessable_entity
      end
    end
  end
end
