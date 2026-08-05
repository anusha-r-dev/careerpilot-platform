module Api
  module V1
    module Admin
      class SourcesController < ApplicationController
        include Authentication
        include ApiRendering

        before_action :authenticate_user!
        before_action :require_admin!
        before_action :set_source, only: :update

        def index
          sources = JobSource.order(:name)
          render json: { sources: sources.map { |source| serialize_source(source) } }
        end

        def create
          source = JobSource.new(source_params)

          if source.save
            render json: { source: serialize_source(source) }, status: :created
          else
            render_errors(source)
          end
        end

        def update
          if @source.update(source_params)
            render json: { source: serialize_source(@source) }
          else
            render_errors(@source)
          end
        end

        private

        def set_source
          @source = JobSource.find(params[:id])
        end

        def source_params
          params.require(:source).permit(
            :name,
            :home_url,
            :search_url,
            :accent,
            :active
          )
        end

        def render_errors(source)
          render json: { errors: source.errors.full_messages },
            status: :unprocessable_entity
        end
      end
    end
  end
end
