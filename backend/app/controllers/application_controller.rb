class ApplicationController < ActionController::API
  include ActionController::Cookies

  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "The requested record was not found." }, status: :not_found
  end
end
