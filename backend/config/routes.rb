Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get :health, to: "health#show"
      resource :session, only: %i[show create destroy]
      resource :registration, only: :create
      resources :sources, only: :index
      resource :dashboard, only: :show
      resources :applications, only: %i[index create update destroy]
      resources :interviews, only: :create
      resources :portal_profiles, only: %i[index create update destroy] do
        member do
          patch :opened
        end
      end
      resources :integrations, only: %i[index destroy] do
        collection do
          post "gmail/start", action: :gmail_start
          get "gmail/callback", action: :gmail_callback
        end
        member do
          post :sync
        end
      end
      resources :email_imports, only: :index do
        member do
          post :confirm
          patch :ignore
        end
      end

      namespace :admin do
        resource :dashboard, only: :show
        resources :users, only: %i[index update]
        resources :sources, only: %i[index create update]
      end
    end
  end

  if Rails.env.production?
    root "spa#index"
    get "*path", to: "spa#index", constraints: lambda { |request|
      request.format.html? && !request.path.start_with?("/api/")
    }
  end
end
