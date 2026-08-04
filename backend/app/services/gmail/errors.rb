module Gmail
  class Error < StandardError; end
  class ConfigurationError < Error; end
  class ApiError < Error; end
end
