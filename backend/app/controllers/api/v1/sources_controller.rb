module Api
  module V1
    class SourcesController < ApplicationController
      include Authentication
      include ApiRendering

      before_action :authenticate_user!

      def index
        sources = JobSource.active.order(:name)
        render json: { sources: sources.map { |source| serialize_source(source) } }
      end
    end
  end
end
