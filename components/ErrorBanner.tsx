interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20"
    >
      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="text-red-400 font-semibold text-sm mb-0.5">Audit Failed</p>
        <p className="text-red-300/70 text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
