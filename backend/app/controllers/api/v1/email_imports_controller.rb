module Api
  module V1
    class EmailImportsController < ApplicationController
      include Authentication
      include ApiRendering

      before_action :authenticate_user!
      before_action :require_member!
      before_action :set_email_import, only: %i[confirm ignore]

      def index
        connection = current_user.mailbox_connections.gmail.first
        imports = current_user.email_imports.pending.newest_first.limit(50)

        render json: {
          gmail_configured: Gmail::Configuration.configured?,
          connection: serialize_mailbox_connection(connection),
          imports: imports.map { |email_import| serialize_email_import(email_import) }
        }
      end

      def confirm
        unless @email_import.pending?
          render json: { error: "This email has already been reviewed." },
            status: :unprocessable_entity
          return
        end

        application = import_application!
        render json: {
          application: serialize_application(application),
          email_import: serialize_email_import(@email_import.reload)
        }
      rescue ActiveRecord::RecordInvalid => error
        render json: { errors: error.record.errors.full_messages },
          status: :unprocessable_entity
      end

      def ignore
        @email_import.update!(state: :ignored)
        render json: { email_import: serialize_email_import(@email_import) }
      end

      private

      def set_email_import
        @email_import = current_user.email_imports.find(params[:id])
      end

      def import_application!
        attributes = import_params
        job_url = attributes[:job_url].presence || @email_import.job_url
        source_name = attributes[:source_name].presence || @email_import.source_name
        source = JobSource.find_by("LOWER(name) = ?", source_name.to_s.downcase)

        EmailImport.transaction do
          application = current_user.job_applications.find_or_initialize_by(job_url: job_url)
          application.assign_attributes(
            job_source: source,
            company: attributes[:company].presence || @email_import.company,
            title: attributes[:title].presence || @email_import.title,
            status: attributes[:status].presence || @email_import.inferred_status,
            applied_on: @email_import.received_at.to_date,
            notes: "Imported from Gmail after member review: #{@email_import.subject}"
          )
          application.save!
          @email_import.update!(
            state: :imported,
            imported_application: application
          )
          application
        end
      end

      def import_params
        params.fetch(:email_import, {}).permit(
          :company,
          :title,
          :job_url,
          :source_name,
          :status
        )
      end
    end
  end
end
