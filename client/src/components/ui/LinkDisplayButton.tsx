import React, { FC } from 'react';
import { Icon } from 'semantic-ui-react';

import './LinkDisplayButton.scss';

interface LinkDisplayProps {
  href: string;
  [key: string]: any;
}

export const LinkDisplay: FC<LinkDisplayProps> = ({ href, ...rest }) => {
  const hasLink = href === '';
  return hasLink ? (
    <p className="no-link">
      <Icon name="unlinkify" />
      Link
    </p>
  ) : (
    <a {...rest} href={href} className="link-display-link">
      <Icon name="linkify" />
      Link
    </a>
  );
};
