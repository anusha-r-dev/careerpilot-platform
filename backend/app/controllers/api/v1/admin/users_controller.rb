module Api
  module V1
    module Admin
      class UsersController < ApplicationController
        include Authentication
        include ApiRendering

        before_action :authenticate_user!
        before_action :require_admin!
        before_action :set_member, only: :update

        def index
          members = User.member.includes(:job_applications).order(:name)
          render json: {
            users: members.map { |member| serialize_user(member, include_counts: true) }
          }
        end

        def update
          if @member.update(user_params)
            render json: { user: serialize_user(@member, include_counts: true) }
          else
            render json: { errors: @member.errors.full_messages },
              status: :unprocessable_entity
          end
        end

        private

        def set_member
          @member = User.member.includes(:job_applications).find(params[:id])
        end

        def user_params
          params.require(:user).permit(:active)
        end
      end
    end
  end
end
