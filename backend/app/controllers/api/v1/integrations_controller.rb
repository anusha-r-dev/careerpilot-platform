module Api
  module V1
    class IntegrationsController < ApplicationController
      include Authentication
      include ApiRendering

      OAUTH_COOKIE = :careerpilot_gmail_oauth
      OAUTH_DURATION = 10.minutes

      before_action :authenticate_user!, except: :gmail_callback
      before_action :require_member!, except: :gmail_callback
      before_action :set_connection, only: %i[destroy sync]

      def index
        connection = current_user.mailbox_connections.gmail.first

        render json: {
          gmail_configured: Gmail::Configuration.configured?,
          connection: serialize_mailbox_connection(connection)
        }
      end

      def gmail_start
        state = SecureRandom.urlsafe_base64(32)
        cookies.encrypted[OAUTH_COOKIE] = {
          value: { user_id: current_user.id, state: state }.to_json,
          expires: OAUTH_DURATION.from_now,
          httponly: true,
          same_site: :lax,
          secure: Rails.env.production?
        }

        authorization_url = Gmail::OauthClient.new.authorization_url(state: state)
        render json: { authorization_url: authorization_url }
      rescue Gmail::ConfigurationError => error
        render json: { error: error.message }, status: :service_unavailable
      end

      def gmail_callback
        oauth_state = parsed_oauth_state
        validate_oauth_callback!(oauth_state)
        user = User.active.member.find(oauth_state.fetch("user_id"))
        token_data = Gmail::OauthClient.new.exchange_code(params.require(:code))
        access_token = token_data.fetch("access_token")
        profile = Gmail::MailClient.new(access_token: access_token).profile

        connection = user.mailbox_connections.find_or_initialize_by(provider: :gmail)
        connection.email_imports.pending.destroy_all if connection.demo?
        connection.email = profile.fetch("emailAddress")
        connection.access_token = access_token
        connection.refresh_token = token_data["refresh_token"] || connection.refresh_token
        raise Gmail::ApiError, "Google did not return a refresh token." if connection.refresh_token.blank?

        connection.assign_attributes(
          token_expires_at: token_data.fetch("expires_in", 3600).seconds.from_now,
          scope: token_data["scope"],
          status: :active,
          demo: false,
          connected_at: Time.current,
          last_error: nil
        )
        connection.save!
        cookies.delete(OAUTH_COOKIE, same_site: :lax)

        redirect_to_frontend(gmail: "connected")
      rescue ActionController::ParameterMissing, KeyError, ActiveRecord::RecordNotFound,
        Gmail::Error, JSON::ParserError => error
        Rails.logger.warn("Gmail connection failed: #{error.class}")
        cookies.delete(OAUTH_COOKIE, same_site: :lax)
        redirect_to_frontend(gmail: "error")
      end

      def sync
        result = Gmail::Synchronizer.new(@connection).call
        render json: result.merge(connection: serialize_mailbox_connection(@connection.reload))
      rescue Gmail::Error => error
        render json: { error: error.message }, status: :unprocessable_entity
      end

      def destroy
        @connection.destroy!
        head :no_content
      end

      private

      def set_connection
        @connection = current_user.mailbox_connections.find(params[:id])
      end

      def parsed_oauth_state
        value = cookies.encrypted[OAUTH_COOKIE]
        raise Gmail::ApiError, "The Gmail connection request expired." if value.blank?

        JSON.parse(value)
      end

      def validate_oauth_callback!(oauth_state)
        returned_state = params[:state].to_s
        expected_state = oauth_state.fetch("state").to_s
        valid = returned_state.bytesize == expected_state.bytesize &&
          ActiveSupport::SecurityUtils.secure_compare(returned_state, expected_state)

        raise Gmail::ApiError, "The Gmail authorization state was invalid." unless valid
        raise Gmail::ApiError, "Google authorization was cancelled." if params[:error].present?
      end

      def redirect_to_frontend(parameters)
        uri = URI("#{Gmail::Configuration.frontend_url}/app")
        uri.query = URI.encode_www_form(parameters)
        uri.fragment = "email-imports"
        redirect_to uri.to_s, allow_other_host: true
      end
    end
  end
end
