import React, { FC, ReactElement } from 'react';
import { Message } from 'semantic-ui-react';

export const InternalDisplay: FC = (): ReactElement => (
  <Message warning>
    {/* <Icon name="eye slash outline"></Icon> */}
    Internal Story
  </Message>
);
