import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  name: string;
}
interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="stage-pad">
        <div className="panel max-w-xl p-6">
          <h1 className="t-h2">This chapter hit a snag</h1>
          <p className="mt-2 text-muted">{this.props.name} could not be drawn. Press R to reset the demo, or pick another chapter from the rail.</p>
          <button
            type="button"
            className="mt-4 min-h-11 rounded-lg border border-ivory/60 px-4 hover:bg-ivory/10"
            onClick={() => this.setState({ failed: false })}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
