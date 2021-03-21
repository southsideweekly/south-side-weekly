import React, { useEffect, useState, ReactElement } from 'react';
import { IPitch } from 'ssw-common';
import { Search } from 'semantic-ui-react';

import { getUnclaimedPitches, isError } from '../../utils/apiWrapper';
import PitchGrid from '../../components/PitchDoc/PitchGrid';
import ProfileSidebar from '../../components/PitchDoc/Sidebar';
import SubmitPitchModal from '../../components/PitchDoc/SubmitPitchModal';
import Logo from '../../assets/ssw-form-header.png';

import '../../css/pitchDoc/PitchDoc.css';

function PitchDoc(): ReactElement {
  const [unclaimedPitches, setUnclaimedPitches] = useState<IPitch[]>([]);

  useEffect(() => {
    const getAllUnclaimedPitches = async (): Promise<void> => {
      const resp = await getUnclaimedPitches();

      if (!isError(resp) && resp.data) {
        setUnclaimedPitches(resp.data.result);
      }
    };

    getAllUnclaimedPitches();
  }, []);

  return (
    <>
      <ProfileSidebar></ProfileSidebar>
      <div className="logo-header">
        <img className="logo" alt="SSW Logo" src={Logo} />
      </div>

      <div className="content-wrapper">
        <div className="top-section">
          <div className="pitchdoc-title">The Pitch Doc</div>
          <div className="container">
            <SubmitPitchModal></SubmitPitchModal>
            <div className="search-bar">
              <Search> </Search>
            </div>

            <div className="break"></div>

            <div className="filter-section">
              <div className="filter-text"> Filter/Sort By: </div>
              {/* <Dropdown placeholder='Roles' /> */}
            </div>
          </div>
        </div>

        <div className="pitch-grid">
          <PitchGrid pitches={unclaimedPitches} />
        </div>
      </div>
    </>
  );
}

export default PitchDoc;
