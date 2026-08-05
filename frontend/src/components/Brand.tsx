interface BrandProps {
  dark?: boolean
}

export function Brand({ dark = false }: BrandProps) {
  return (
    <span className={dark ? 'brand brand--dark' : 'brand'}>
      <span aria-hidden="true">CP</span>
      <span>
        <strong>CareerPilot</strong>
        <small>Job search, organized</small>
      </span>
    </span>
  )
}
