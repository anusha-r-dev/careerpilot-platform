module ApiRendering
  extend ActiveSupport::Concern

  private

  def serialize_user(user, include_counts: false)
    data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      headline: user.headline,
      location: user.location
    }

    if include_counts
      data[:application_count] = user.job_applications.size
      data[:interview_count] = user.job_applications.count(&:interview?)
    end

    data
  end

  def serialize_source(source)
    {
      id: source.id,
      name: source.name,
      home_url: source.home_url,
      search_url: source.search_url,
      accent: source.accent,
      active: source.active,
      remote_focused: source.remote_focused
    }
  end

  def serialize_application(application)
    {
      id: application.id,
      company: application.company,
      title: application.title,
      location: application.location,
      employment_type: application.employment_type,
      job_url: application.job_url,
      status: application.status,
      notes: application.notes,
      applied_on: application.applied_on&.iso8601,
      next_action_on: application.next_action_on&.iso8601,
      salary_note: application.salary_note,
      remote: application.remote,
      source: application.job_source && serialize_source(application.job_source),
      interviews: application.interviews.sort_by(&:starts_at).map do |interview|
        serialize_interview(interview)
      end,
      created_at: application.created_at.iso8601
    }
  end

  def serialize_interview(interview)
    {
      id: interview.id,
      starts_at: interview.starts_at.iso8601,
      interview_type: interview.interview_type,
      duration_minutes: interview.duration_minutes,
      contact_name: interview.contact_name,
      meeting_url: interview.meeting_url,
      notes: interview.notes
    }
  end

  def serialize_mailbox_connection(connection)
    return if connection.blank?

    {
      id: connection.id,
      provider: connection.provider,
      email: connection.email,
      status: connection.status,
      demo: connection.demo,
      connected_at: connection.connected_at&.iso8601,
      last_synced_at: connection.last_synced_at&.iso8601,
      last_error: connection.last_error,
      pending_count: connection.email_imports.pending.count
    }
  end

  def serialize_email_import(email_import)
    {
      id: email_import.id,
      sender: email_import.sender,
      subject: email_import.subject,
      received_at: email_import.received_at.iso8601,
      company: email_import.company,
      title: email_import.title,
      job_url: email_import.job_url,
      source_name: email_import.source_name,
      inferred_status: email_import.inferred_status,
      confidence: email_import.confidence,
      snippet: email_import.snippet,
      state: email_import.state,
      imported_application_id: email_import.imported_application_id
    }
  end

  def serialize_portal_profile(profile)
    return if profile.blank?

    {
      id: profile.id,
      job_source_id: profile.job_source_id,
      account_label: profile.account_label,
      profile_url: profile.profile_url,
      applications_url: profile.applications_url,
      launch_url: profile.launch_url,
      last_opened_at: profile.last_opened_at&.iso8601
    }
  end
end
