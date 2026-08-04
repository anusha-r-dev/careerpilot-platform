import { useEmailImports } from '../hooks/useEmailImports'
import { AppIcon } from './AppIcon'
import { EmailImportCard } from './EmailImportCard'

interface EmailImportCenterProps {
  onPipelineChanged: () => Promise<void>
}

function formattedSyncTime(value: string | null) {
  if (!value) return 'Not synchronized yet'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function EmailImportCenter({
  onPipelineChanged,
}: EmailImportCenterProps) {
  const center = useEmailImports()
  const connection = center.data?.connection
  const imports = center.data?.imports ?? []
  const gmailConfigured = center.data?.gmail_configured ?? false
  const realConnection = connection && !connection.demo

  return (
    <section className="email-import-section" id="email-imports">
      <div className="email-import-heading">
        <div>
          <p className="eyebrow">Automatic application discovery</p>
          <h2>Application inbox</h2>
          <p>
            Connect Gmail securely, detect recruiting emails, and review every
            suggestion before it enters your private pipeline.
          </p>
        </div>
        <div className="email-privacy-label">
          <AppIcon name="lock" size={17} />
          Member-only email data
        </div>
      </div>

      <div className="mailbox-control">
        <div className="mailbox-control__identity">
          <span className="gmail-mark">M</span>
          <div>
            <p>{realConnection ? 'Gmail connected' : 'Gmail import preview'}</p>
            <strong>{connection?.email ?? 'No mailbox connected'}</strong>
            <small>
              {connection?.demo
                ? 'Synthetic emails are stored in PostgreSQL for safe portfolio review.'
                : formattedSyncTime(connection?.last_synced_at ?? null)}
            </small>
          </div>
        </div>

        <div className="mailbox-control__status">
          <span className={realConnection ? 'status-live' : 'status-preview'}>
            {realConnection ? 'Automatic sync active' : 'Safe preview mode'}
          </span>
          {realConnection ? (
            <div>
              <button
                className="button button--light"
                disabled={center.busyAction === 'sync'}
                type="button"
                onClick={() => void center.sync()}
              >
                <AppIcon name="refresh" size={16} />
                {center.busyAction === 'sync' ? 'Synchronizing…' : 'Sync now'}
              </button>
              <button
                className="text-button"
                disabled={center.busyAction === 'disconnect'}
                type="button"
                onClick={() => void center.disconnect()}
              >
                Disconnect
              </button>
            </div>
          ) : (
            gmailConfigured ? (
              <button
                className="button button--light"
                disabled={center.busyAction === 'connect'}
                type="button"
                onClick={() => void center.startConnection()}
              >
                <AppIcon name="mail" size={17} />
                {center.busyAction === 'connect'
                  ? 'Opening Google…'
                  : 'Connect real Gmail'}
              </button>
            ) : (
              <a
                className="button button--light"
                href="https://console.cloud.google.com/apis/credentials"
                rel="noreferrer"
                target="_blank"
              >
                <AppIcon name="mail" size={17} />
                Create Gmail OAuth keys
              </a>
            )
          )}
        </div>
      </div>

      {!gmailConfigured && !realConnection && (
        <div className="oauth-setup-note" id="gmail-oauth-setup">
          <AppIcon name="shield" size={20} />
          <div>
            <strong>Google OAuth setup is required before connecting.</strong>
            <p>
              Create an OAuth web client in Google Cloud, enable the Gmail API,
              and add its client ID and secret to local Rails credentials. Then
              restart Rails; this control will automatically change to
              “Connect real Gmail.” Live credentials are never stored in GitHub.
            </p>
            <code>
              http://127.0.0.1:3000/api/v1/integrations/gmail/callback
            </code>
          </div>
        </div>
      )}

      {center.notice && <p className="email-center-notice">{center.notice}</p>}
      {center.error && <p className="email-center-error" role="alert">{center.error}</p>}

      <div className="email-review-heading">
        <div>
          <span>{imports.length.toString().padStart(2, '0')}</span>
          <div>
            <p>Review queue</p>
            <h3>Confirm what the parser found</h3>
          </div>
        </div>
        <p>No email changes your pipeline without your approval.</p>
      </div>

      {center.status === 'loading' && !center.data ? (
        <div className="loading-panel" role="status">
          Loading private email suggestions from PostgreSQL…
        </div>
      ) : (
        <div className="email-import-list">
          {imports.map((emailImport) => (
            <EmailImportCard
              busy={center.busyAction?.endsWith(`-${emailImport.id}`) ?? false}
              emailImport={emailImport}
              key={emailImport.id}
              onConfirm={async (id, input) => {
                await center.confirmImport(id, input)
                await onPipelineChanged()
              }}
              onIgnore={(id) => void center.ignoreImport(id)}
            />
          ))}
          {imports.length === 0 && (
            <div className="empty-email-queue">
              <AppIcon name="inbox" size={28} />
              <h3>Your review queue is clear.</h3>
              <p>New recruiting messages will appear after the next Gmail sync.</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
