import { ReactReCaptchaV3V2 } from 'module/ReactReCaptchaV3V2';
import * as React from 'react';
import { render } from 'react-dom';

/**
 * the main Application component
 */
class App extends React.PureComponent {
  public render(): React.ReactNode {
    return <ReactReCaptchaV3V2 />;
  }
}

render(<App />, document.getElementById('root'));
