import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { trackPageView } from '../../utils/googleAnalytics';

function ScrollToTop({ history }) {
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
      trackPageView(window.location.pathname, document.title);
    });
    return () => {
      unlisten();
    }
  }, [history]);

  return (null);
}

export default withRouter(ScrollToTop);