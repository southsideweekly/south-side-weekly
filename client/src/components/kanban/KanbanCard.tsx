import React, { FC, ReactElement } from 'react';
import { Card, CardProps } from 'semantic-ui-react';
import { Pitch } from 'ssw-common';
import cn from 'classnames';
import { useHistory } from 'react-router-dom';

import { FieldTag } from '../tag/FieldTag';

import './KanbanCard.scss';

interface PitchProps extends CardProps {
  pitch: Pitch;
}

const KanbanCard: FC<PitchProps> = ({ pitch, ...rest }): ReactElement => {
  const history = useHistory();

  return (
    <Card
      onClick={() => history.push(`pitch/${pitch._id}`)}
      className={cn('kanban-pitch', rest.className)}
    >
      <p className="pitch-text">
        <b>{pitch.title} </b>
        <span className="due-date">
          {' '}
          Due{' '}
          {pitch.deadline
            ? new Date(pitch.deadline).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </span>
      </p>
      <div className="pitch-info">
        <dt>
          Edit
          <> </>
          <FieldTag
            size="mini"
            name={pitch.editStatus}
            content={pitch.editStatus}
          />
        </dt>
        <dt>
          Fact Checking
          <> </>
          <FieldTag
            size="mini"
            name={pitch.factCheckingStatus}
            content={pitch.factCheckingStatus}
          />
        </dt>
        <dt>
          Visuals
          <> </>
          <FieldTag
            size="mini"
            name={pitch.visualStatus}
            content={pitch.visualStatus}
          />
        </dt>
        <dt>
          Layout
          <> </>
          <FieldTag
            size="mini"
            name={pitch.layoutStatus}
            content={pitch.layoutStatus}
          />
        </dt>
      </div>
      <p className="pitch-text">
        Page Count: {pitch.pageCount ? pitch.pageCount : 'NA'}
      </p>
    </Card>
  );
};

export default KanbanCard;
