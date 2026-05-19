// Class-based error boundary — catches render errors in child components
// and shows a fallback message so a broken subtree does not crash the page.
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          color: 'var(--color-accent, #b3a1ff)',
          padding: '2rem',
          fontFamily: '"Chelsea Market", system-ui',
          textAlign: 'center',
        }}>
          Something went wrong.
        </div>
      );
    }
    return this.props.children;
  }
}
