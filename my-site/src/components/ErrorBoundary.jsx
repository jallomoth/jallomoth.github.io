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
