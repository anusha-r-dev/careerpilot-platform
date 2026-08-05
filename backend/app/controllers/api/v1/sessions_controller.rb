module Api
  module V1
    class SessionsController < ApplicationController
      include Authentication
      include ApiRendering

      before_action :authenticate_user!, only: %i[show destroy]

      def show
        render json: { user: serialize_user(current_user) }
      end

      def create
        user = User.find_by(email: login_params[:email].to_s.strip.downcase)

        unless user&.active? && user.authenticate(login_params[:password])
          render json: { error: "Email or password is incorrect." }, status: :unauthorized
          return
        end

        if login_params[:portal] == "admin" && !user.admin?
          render json: { error: "This account does not have administrator access." },
            status: :forbidden
          return
        end

        if login_params[:portal] == "member" && !user.member?
          render json: { error: "Use the administrator login for this account." },
            status: :forbidden
          return
        end

        start_session_for(user)
        render json: { user: serialize_user(user) }, status: :created
      end

      def destroy
        end_current_session
        head :no_content
      end

      private

      def login_params
        params.require(:session).permit(:email, :password, :portal)
      end
    end
  end
end
