import React, { FC, ReactElement } from 'react';
import { IPitch } from 'ssw-common';
import { Grid } from 'semantic-ui-react';

import PitchCard from './PitchCard';
import ClaimPitchModal from '../../components/PitchDoc/ClaimPitchModal';
interface IProps {
  pitches: IPitch[];
}

const PitchGrid: FC<IProps> = ({ pitches }): ReactElement => (
  <Grid>
    <Grid.Row columns={3}>
      {pitches.map((pitch, idx) => (
        <Grid.Column key={idx}>
          <ClaimPitchModal pitch={pitch}/>
        </Grid.Column>
      ))}
    </Grid.Row>
  </Grid>
);

export default PitchGrid;
