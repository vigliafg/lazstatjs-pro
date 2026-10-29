import { Component, type ErrorInfo, type ReactNode } from 'react';
import { downloadText } from '../io/writers';
import { t } from '../i18n';

interface Props {
  /** Human-readable name of the area that failed (Data, Analysis, Help). */
  label: string;
  /** Changing this key clears a previous error without remounting healthy panes. */
  resetKey?: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
  resetKey?: string;
}

/** Keeps one broken pane from taking the whole project down. */
export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (state.resetKey === props.resetKey) return null;
    return { error: null, resetKey: props.resetKey };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.label}]`, error, info.componentStack);
  }

  private reload = () => window.location.reload();

  private downloadDiagnostics = () => {
    const error = this.state.error;
    const payload = {
      area: this.props.label,
      message: error?.message ?? 'Unknown error',
      stack: error?.stack ?? '',
      userAgent: navigator.userAgent,
      url: window.location.href,
      at: new Date().toISOString(),
    };
    downloadText(JSON.stringify(payload, null, 2), 'lazstats-diagnostics.json', 'application/json');
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-red">
          {t('error.title')}
        </p>
        <p className="max-w-md text-[12px] leading-relaxed text-text2">
          {t('error.body')}
        </p>
        <p className="max-w-md truncate font-mono text-[10px] text-text3">
          {this.state.error.message}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className="tb-btn px-3 py-1 text-[11px]" onClick={this.reload}>
            {t('error.reload')}
          </button>
          <button
            type="button"
            className="tb-btn px-3 py-1 text-[11px]"
            onClick={this.downloadDiagnostics}
          >
            {t('error.download')}
          </button>
        </div>
      </div>
    );
  }
}
