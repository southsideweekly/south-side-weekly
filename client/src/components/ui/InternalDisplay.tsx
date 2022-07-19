import React, { FC, ReactElement } from 'react';
import { Icon } from 'semantic-ui-react';
import './InternalDisplay.scss';

export const InternalDisplay: FC = (): ReactElement => (
  <p className="internal-display">
    <Icon name="eye slash outline"></Icon>Internal Story
  </p>
);
