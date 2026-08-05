module Api
  module V1
    class RegistrationsController < ApplicationController
      include Authentication
      include ApiRendering

      def create
        user = User.new(registration_params.merge(role: :member))

        if user.save
          start_session_for(user)
          render json: { user: serialize_user(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages },
            status: :unprocessable_entity
        end
      end

      private

      def registration_params
        params.require(:registration).permit(
          :name,
          :email,
          :password,
          :password_confirmation,
          :headline,
          :location
        )
      end
    end
  end
end
