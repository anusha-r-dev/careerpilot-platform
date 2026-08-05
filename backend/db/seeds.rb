# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
demo_password = ENV.fetch("CAREERPILOT_DEMO_PASSWORD", "CareerPilotDemo123!")

admin = User.find_or_initialize_by(email: "admin@careerpilot.demo")
admin.update!(
  name: "Platform Admin",
  password: demo_password,
  password_confirmation: demo_password,
  role: :admin,
  active: true,
  headline: "CareerPilot administrator",
  location: "India"
)

anusha = User.find_or_initialize_by(email: "anusha@careerpilot.demo")
anusha.update!(
  name: "Anusha R",
  password: demo_password,
  password_confirmation: demo_password,
  role: :member,
  active: true,
  headline: "Software Developer",
  location: "Bengaluru, India"
)

priya = User.find_or_initialize_by(email: "priya@careerpilot.demo")
priya.update!(
  name: "Priya R",
  password: demo_password,
  password_confirmation: demo_password,
  role: :member,
  active: true,
  headline: "Data Analyst",
  location: "Hyderabad, India"
)

source_attributes = [
  {
    name: "LinkedIn",
    home_url: "https://www.linkedin.com/jobs/",
    search_url: "https://www.linkedin.com/jobs/search/",
    accent: "blue",
    remote_focused: false
  },
  {
    name: "Indeed",
    home_url: "https://in.indeed.com/",
    search_url: "https://in.indeed.com/jobs",
    accent: "violet",
    remote_focused: false
  },
  {
    name: "Naukri",
    home_url: "https://www.naukri.com/",
    search_url: "https://www.naukri.com/jobs-in-india",
    accent: "orange",
    remote_focused: false
  },
  {
    name: "Wellfound",
    home_url: "https://wellfound.com/",
    search_url: "https://wellfound.com/jobs",
    accent: "black",
    remote_focused: false
  },
  {
    name: "Glassdoor",
    home_url: "https://www.glassdoor.co.in/",
    search_url: "https://www.glassdoor.co.in/Job/index.htm",
    accent: "green",
    remote_focused: false
  },
  {
    name: "Remote OK",
    home_url: "https://remoteok.com/",
    search_url: "https://remoteok.com/remote-dev-jobs",
    accent: "yellow",
    remote_focused: true
  },
  {
    name: "We Work Remotely",
    home_url: "https://weworkremotely.com/",
    search_url: "https://weworkremotely.com/remote-jobs/all-jobs",
    accent: "coral",
    remote_focused: true
  },
  {
    name: "Remotive",
    home_url: "https://remotive.com/",
    search_url: "https://remotive.com/",
    accent: "cyan",
    remote_focused: true
  },
  {
    name: "Remote.co",
    home_url: "https://remote.co/",
    search_url: "https://remote.co/remote-jobs",
    accent: "plum",
    remote_focused: true
  },
  {
    name: "Working Nomads",
    home_url: "https://www.workingnomads.com/",
    search_url: "https://www.workingnomads.com/jobs",
    accent: "teal",
    remote_focused: true
  },
  {
    name: "Himalayas",
    home_url: "https://himalayas.app/",
    search_url: "https://himalayas.app/jobs",
    accent: "rose",
    remote_focused: true
  },
  {
    name: "FlexJobs",
    home_url: "https://www.flexjobs.com/",
    search_url: "https://www.flexjobs.com/remote-jobs",
    accent: "indigo",
    remote_focused: true
  }
]

sources = source_attributes.each_with_object({}) do |attributes, records|
  source = JobSource.find_or_initialize_by(name: attributes[:name])
  source.update!(attributes)
  records[attributes[:name]] = source
end

anusha.job_applications.destroy_all

frontend_role = anusha.job_applications.create!(
  job_source: sources.fetch("LinkedIn"),
  company: "Atlassian",
  title: "Frontend Software Engineer",
  location: "Bengaluru, India",
  employment_type: "Full-time",
  job_url: "https://www.atlassian.com/company/careers",
  status: :saved,
  notes: "Review the frontend platform requirements before applying.",
  next_action_on: Time.zone.today,
  remote: true
)

anusha.job_applications.create!(
  job_source: sources.fetch("Naukri"),
  company: "Freshworks",
  title: "Software Developer II",
  location: "Chennai, India",
  employment_type: "Full-time",
  job_url: "https://www.freshworks.com/company/careers/",
  status: :applied,
  notes: "Application submitted with the full-stack resume.",
  applied_on: Time.zone.today - 4.days,
  next_action_on: Time.zone.today + 2.days,
  remote: false
)

interview_application = anusha.job_applications.create!(
  job_source: sources.fetch("Indeed"),
  company: "Canva",
  title: "Full Stack Engineer",
  location: "Remote",
  employment_type: "Full-time",
  job_url: "https://www.canva.com/careers/",
  status: :interview,
  notes: "Prepare React performance and API design examples.",
  applied_on: Time.zone.today - 9.days,
  next_action_on: Time.zone.today + 1.day,
  remote: true
)

interview_application.interviews.create!(
  starts_at: 1.day.from_now.change(hour: 16, min: 0),
  interview_type: :technical,
  duration_minutes: 60,
  contact_name: "Hiring team",
  meeting_url: "https://example.com/demo-interview",
  notes: "Portfolio walkthrough and technical discussion."
)

anusha.job_applications.create!(
  job_source: sources.fetch("Wellfound"),
  company: "Postman",
  title: "Product Engineer",
  location: "Bengaluru, India",
  employment_type: "Full-time",
  job_url: "https://www.postman.com/company/careers/",
  status: :offer,
  notes: "Demo offer stage for the portfolio workflow.",
  applied_on: Time.zone.today - 18.days,
  next_action_on: Time.zone.today + 3.days,
  salary_note: "Discuss during final call",
  remote: true
)

anusha.job_applications.create!(
  job_source: sources.fetch("Glassdoor"),
  company: "Razorpay",
  title: "UI Engineer",
  location: "Bengaluru, India",
  employment_type: "Full-time",
  job_url: "https://razorpay.com/jobs/",
  status: :rejected,
  notes: "Keep the feedback and revisit similar roles later.",
  applied_on: Time.zone.today - 25.days,
  remote: false
)

priya.job_applications.find_or_create_by!(
  job_url: "https://careers.microsoft.com/"
) do |application|
  application.assign_attributes(
    job_source: sources.fetch("LinkedIn"),
    company: "Microsoft",
    title: "Data Analyst",
    location: "Hyderabad, India",
    employment_type: "Full-time",
    status: :applied,
    applied_on: Time.zone.today - 2.days
  )
end

portal_profile_attributes = [
  {
    source: sources.fetch("LinkedIn"),
    account_label: "Demo professional profile",
    profile_url: "https://www.linkedin.com/in/",
    applications_url: "https://www.linkedin.com/my-items/saved-jobs/"
  },
  {
    source: sources.fetch("Naukri"),
    account_label: "Demo job seeker profile",
    profile_url: "https://www.naukri.com/mnjuser/profile",
    applications_url: "https://www.naukri.com/mnjuser/myapply"
  },
  {
    source: sources.fetch("Indeed"),
    account_label: "Demo job seeker profile",
    profile_url: "https://profile.indeed.com/",
    applications_url: "https://myjobs.indeed.com/applied"
  }
]

portal_profile_attributes.each do |attributes|
  profile = anusha.job_portal_profiles.find_or_initialize_by(
    job_source: attributes.fetch(:source)
  )
  next unless profile.new_record?

  profile.assign_attributes(attributes.except(:source))
  profile.save!
end

demo_mailbox = anusha.mailbox_connections.find_or_initialize_by(provider: :gmail)
if demo_mailbox.new_record?
  demo_mailbox.assign_attributes(
    email: "anusha@careerpilot.demo",
    status: :active,
    demo: true,
    connected_at: Time.current,
    last_synced_at: Time.current,
    scope: "synthetic portfolio preview"
  )
  demo_mailbox.save!
end

if demo_mailbox.demo?
  synthetic_imports = [
    {
      provider_message_id: "demo-github-application",
      sender: "GitHub Careers <careers@example.test>",
      subject: "Application submitted: Platform Engineer at GitHub",
      received_at: 2.hours.ago,
      company: "GitHub",
      title: "Platform Engineer",
      job_url: "https://www.github.careers/careers-home/jobs/",
      source_name: "Company careers",
      inferred_status: :applied,
      confidence: 92,
      snippet: "Thank you for applying. We received your application for the Platform Engineer role.",
      detected_at: 2.hours.ago
    },
    {
      provider_message_id: "demo-stripe-interview",
      sender: "Stripe Recruiting <recruiting@example.test>",
      subject: "Interview invitation for Frontend Engineer at Stripe",
      received_at: 1.day.ago,
      company: "Stripe",
      title: "Frontend Engineer",
      job_url: "https://stripe.com/jobs/search",
      source_name: "LinkedIn",
      inferred_status: :interview,
      confidence: 95,
      snippet: "We would like to schedule a technical interview for the Frontend Engineer position.",
      detected_at: 1.day.ago
    },
    {
      provider_message_id: "demo-notion-update",
      sender: "Notion Talent <talent@example.test>",
      subject: "Update on your application for Software Engineer at Notion",
      received_at: 3.days.ago,
      company: "Notion",
      title: "Software Engineer",
      job_url: "https://www.notion.com/careers",
      source_name: "Indeed",
      inferred_status: :rejected,
      confidence: 88,
      snippet: "Unfortunately, we will not be moving forward with your application at this time.",
      detected_at: 3.days.ago
    }
  ]

  synthetic_imports.each do |attributes|
    demo_mailbox.email_imports.find_or_create_by!(
      provider_message_id: attributes[:provider_message_id]
    ) do |email_import|
      email_import.assign_attributes(attributes.merge(user: anusha))
    end
  end
end

puts "Seeded #{User.count} users, #{JobSource.count} sources, " \
  "#{JobApplication.count} applications, #{Interview.count} interview, and " \
  "#{JobPortalProfile.count} portal profiles and #{EmailImport.count} email imports."
