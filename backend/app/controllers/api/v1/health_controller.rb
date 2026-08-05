module Api
  module V1
    class HealthController < ApplicationController
      def show
        ActiveRecord::Base.connection.execute("SELECT 1")

        render json: {
          status: "ok",
          service: "careerpilot-api",
          database: "connected",
          checked_at: Time.current.iso8601
        }
      rescue ActiveRecord::ActiveRecordError
        render json: {
          status: "degraded",
          service: "careerpilot-api",
          database: "unavailable",
          checked_at: Time.current.iso8601
        }, status: :service_unavailable
      end
    end
  end
end
