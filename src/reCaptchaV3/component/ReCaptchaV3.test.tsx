import { render, RenderResult } from '@testing-library/react';
import * as React from 'react';
import { IContext } from 'src/provider/IContext';
import { ReCaptchaV3 } from './ReCaptchaV3';
import { TCallback } from './TCallback';
import { TRefreshToken } from './TRefreshToken';

// mocked global functions types
declare let global: {
  grecaptcha: {
    render: jest.Mock;
    reset: jest.Mock;
    getResponse: jest.Mock;
    execute: jest.Mock<(siteKey: string, options?: options) => Promise<string>>;
  };
};

describe('ReCaptchaV3 component', (): void => {
  let callback: jest.Mock<TCallback>;
  let refreshTokenFn: TRefreshToken | undefined;
  let providerContext: IContext;
  let rr: RenderResult;
  let node: ChildNode | null;

  describe('without the V3 site key', (): void => {
    beforeEach((): void => {
      callback = jest.fn();
      providerContext = {
        siteKeyV2: undefined,
        siteKeyV3: undefined,
        loaded: false
      };
    });

    it('throws an Error', (): void => {
      expect(
        (): ReCaptchaV3 =>
          new ReCaptchaV3({
            action: 'test-action',
            callback,
            providerContext: providerContext
          })
      ).toThrow(
        'The prop "siteKeyV3" must be set on the ReCaptchaProvider before using the ReCaptchaV3 component'
      );
    });
  });

  describe('with a V3 site key', (): void => {
    beforeEach((): void => {
      callback = jest
        .fn()
        .mockImplementation(
          (token: string | void, refreshToken: TRefreshToken | void): void => {
            if (refreshToken) {
              refreshTokenFn = refreshToken;
            }
          }
        );
      refreshTokenFn = undefined;
      providerContext = {
        siteKeyV2: undefined,
        siteKeyV3: 'test',
        loaded: false
      };
    });

    describe('and required props', (): void => {
      beforeEach((): void => {
        rr = render(
          <ReCaptchaV3
            action="test-action"
            callback={callback}
            providerContext={providerContext}
          />
        );
        node = rr.container.firstChild;
      });

      it('renders nothing', (): void => {
        expect(node).toBeFalsy();
      });

      describe('when providerContext.loaded changes to true', (): void => {
        beforeEach((): void => {
          // make sure the mocked callback hasn't been called before
          callback.mockClear();
          // mock the google reCaptcha object
          global.grecaptcha = {
            render: jest.fn(),
            reset: jest.fn(),
            getResponse: jest.fn(),
            execute: jest
              .fn()
              .mockImplementation(
                (siteKey: string, options?: options): Promise<string> =>
                  Promise.resolve('test-token')
              )
          };
          // change loaded to true
          providerContext = {
            ...providerContext,
            loaded: true
          };
          rr.rerender(
            <ReCaptchaV3
              action="test-action"
              callback={callback}
              providerContext={providerContext}
            />
          );
        });

        it('invokes the google reCaptcha execute once', (): void => {
          expect(global.grecaptcha.execute).toHaveBeenCalledTimes(1);
        });

        it('invokes the callback twice', (): void => {
          expect(callback).toHaveBeenCalledTimes(2);
        });

        it('invokes the callback without any arguments', (): void => {
          expect(callback).toHaveBeenNthCalledWith(1);
        });

        it('invokes the callback with the token and refreshToken function', (): void => {
          expect(callback).toHaveBeenNthCalledWith(
            2,
            'test-token',
            expect.any(Function)
          );
        });

        it('sets the refresh token function', (): void => {
          expect(refreshTokenFn).toBeInstanceOf(Function);
        });

        describe('refresh token function', (): void => {
          beforeEach((): void => {
            global.grecaptcha.execute.mockClear();
            if (refreshTokenFn) {
              refreshTokenFn();
            }
          });

          it('invokes the google reCaptcha execute once', (): void => {
            expect(global.grecaptcha.execute).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
