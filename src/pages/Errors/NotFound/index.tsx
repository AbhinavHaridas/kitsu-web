import React from 'react';
import { FormattedMessage } from 'react-intl';

import { ReactComponent as Background } from 'app/assets/illustrations/not-found/background.svg';
import { ReactComponent as Foreground } from 'app/assets/illustrations/not-found/foreground.svg';
import ErrorPage from 'app/layouts/Error';

import styles from './styles.module.css';

export default function NotFoundPage(): JSX.Element {
  return (
    <ErrorPage
      title={<FormattedMessage defaultMessage="Uh oh, you're lost!" />}
      subtitle={
        <FormattedMessage defaultMessage="We couldn’t find this page. It may have moved, or it may have disappeared into space." />
      }
      illustration={
        <>
          <Background className={styles.illustrationBackground} />
          <Foreground className={styles.illustrationForeground} />
        </>
      }
      search={false}
    />
  );
}
