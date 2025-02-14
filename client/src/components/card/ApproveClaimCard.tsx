import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  Checkbox,
  Divider,
  Icon,
  Input,
  Label,
  Popup,
} from 'semantic-ui-react';
import { Team, User, UserFields } from 'ssw-common';
import Swal from 'sweetalert2';

import { FieldTag } from '..';
import { apiCall, isError } from '../../api';
import { useAuth } from '../../contexts';
import { rolesEnum } from '../../utils/enums';
import {
  extractErrorMessage,
  getUserFullName,
  pluralize,
} from '../../utils/helpers';
import ContributorFeedback from '../modal/ContributorFeedback';
import { SingleSelect } from '../select/SingleSelect';
import UserChip from '../tag/UserChip';
import { AuthView } from '../wrapper/AuthView';
import './ApproveClaimCard.scss';

interface ApproveClaimCardProps {
  pendingContributors: { user: UserFields; message: string }[];
  assignmentContributors: UserFields[];
  team: Team & { target: number };
  pitchId: string;
  completed: boolean;
  notApproved: boolean;
  callback: () => Promise<void>;
  isInternal: boolean;
}

const ApproveClaimCard: FC<ApproveClaimCardProps> = ({
  team,
  pendingContributors,
  assignmentContributors,
  pitchId,
  completed,
  notApproved,
  callback,
  isInternal,
}): ReactElement => {
  const { user } = useAuth();
  const [selectContributorMode, setSelectContributorMode] = useState(false);
  const [filteredContribtors, setFilteredContributors] = useState<User[]>([]);
  const [allTeamContributors, setAllTeamContributors] = useState<User[] | null>(
    null,
  );
  const [selectedContributor, setSelectedContributor] = useState('');
  const [editTargetMode, setEditTargetMode] = useState(false);

  const [totalPositions, setTotalPositions] = useState(0);
  const [claimNotify, setClaimNotify] = useState(true);
  const [addNotify, setAddNotify] = useState(true);

  const addContributor = async (): Promise<void> => {
    if (selectedContributor) {
      let shouldCancelChange = false;
      if (team.name === 'Writing' && assignmentContributors[0]) {
        await Swal.fire({
          title: 'Writer already exists.',
          text: `This action will remove the current Writer, ${assignmentContributors[0].fullname}. Contributors on this pitch will not be alerted of this.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Assign New Writer',
        }).then((result) => {
          if (!result.isConfirmed) {
            shouldCancelChange = true;
          }
        });
      }
      if (shouldCancelChange) {
        return;
      }

      const res = await apiCall({
        method: 'PUT',
        url: `/pitches/${pitchId}/addContributor`,
        body: {
          userId: selectedContributor,
          teamId: team._id,
        },
        query: {
          writer: team.name === 'Writing',
        },
        failureMessage: 'Failed to add contributor',
      });

      if (!isError(res)) {
        addNotify &&
          (await apiCall({
            method: 'POST',
            url: '/notifications/sendContributorAdded',
            body: {
              contributorId: selectedContributor,
              staffId: user?._id,
              pitchId: pitchId,
            },
          }));
        toast.success('Added contributor');
        setSelectContributorMode(false);
      } else {
        toast.error(extractErrorMessage(res));
      }
    }

    await callback();
  };

  const removeContributor = async (userId: string): Promise<void> => {
    const res = await apiCall({
      method: 'PUT',
      url: `/pitches/${pitchId}/removeContributor`,
      body: {
        userId: userId,
        teamId: team._id,
      },
      query: {
        writer: team.name === 'Writing',
      },
      failureMessage: 'Failed to remove contributor',
    });

    if (!isError(res)) {
      toast.success('Removed contributor');
    } else {
      toast.error(extractErrorMessage(res));
    }

    await callback();
  };

  const approveClaim = async (userId: string): Promise<void> => {
    const res = await apiCall({
      method: 'PUT',
      url: `/pitches/${pitchId}/approveClaim`,
      body: {
        userId: userId,
        teamId: team._id,
      },
      query: {
        writer: team.name === 'Writing',
      },
      failureMessage: 'Failed to approve contributor claim',
    });

    if (!isError(res)) {
      claimNotify &&
        apiCall({
          method: 'POST',
          url: '/notifications/sendClaimRequestApproved',
          body: {
            contributorId: userId,
            pitchId: pitchId,
            staffId: user?._id,
            teamId: team._id,
          },
        });
      toast.success('Approved contributor claim');
    } else {
      toast.error(extractErrorMessage(res));
    }

    await callback();
  };

  const declineClaim = async (userId: string): Promise<void> => {
    const res = await apiCall({
      method: 'PUT',
      url: `/pitches/${pitchId}/declineClaim`,
      body: {
        userId: userId,
        teamId: team._id,
      },
      failureMessage: 'Failed to decline contributor claim',
    });

    if (!isError(res)) {
      claimNotify &&
        apiCall({
          method: 'POST',
          url: '/notifications/sendClaimRequestDeclined',
          body: {
            contributorId: userId,
            pitchId: pitchId,
            staffId: user?._id,
          },
        });
      toast.success('Declined contributor claim');
    } else {
      toast.error(extractErrorMessage(res));
    }

    await callback();
  };

  const changeTarget = async (): Promise<void> => {
    if (totalPositions - assignmentContributors.length < 0) {
      Swal.fire({
        title:
          'The number of positions cannot be less than the current number of contributors',
        icon: 'error',
      });
      return;
    }

    setEditTargetMode(false);

    await apiCall({
      method: 'PUT',
      url: `/pitches/${pitchId}/teamTarget`,
      body: {
        teamId: team._id,
        target: totalPositions - assignmentContributors.length,
      },
    });

    callback();
  };

  const renderAddContributor = (): JSX.Element => {
    if (selectContributorMode) {
      return (
        <div className="select-contributor-row">
          <SingleSelect
            value={selectedContributor}
            options={filteredContribtors.map((contributor) => ({
              value: contributor._id,
              label: getUserFullName(contributor),
            }))}
            onChange={(e) => setSelectedContributor(e ? e.value : '')}
            placeholder="Select Contributor"
            className="select-contributor"
          />
          <div>
            <Checkbox
              label="Notify Users"
              className="notify-button"
              defaultChecked
              onChange={() => setAddNotify(!addNotify)}
            ></Checkbox>
            <Button
              content="Add"
              positive
              onClick={addContributor}
              size="small"
            />
            <Button
              content="Cancel"
              negative
              onClick={() => setSelectContributorMode(false)}
              size="small"
            />
          </div>
        </div>
      );
    } else if (!notApproved) {
      return (
        <AuthView view="minStaff">
          <Label
            className="add-contributor"
            as="a"
            onClick={() => setSelectContributorMode(true)}
          >
            <Icon name="plus" />
            Add contributor
          </Label>
        </AuthView>
      );
    }
    return <></>;
  };

  const filterContributors = useCallback(
    (contributors: User[]): User[] =>
      contributors.filter(
        ({ _id }) =>
          !assignmentContributors.map((user) => user._id).includes(_id) &&
          !pendingContributors.map(({ user }) => user._id).includes(_id),
      ),
    [assignmentContributors, pendingContributors],
  );

  const filterInternal = (contributors: User[]): User[] =>
    contributors.filter(
      ({ role }) => role === rolesEnum.ADMIN || role === rolesEnum.STAFF,
    );

  useEffect(() => {
    const getContributorsByTeam = async (): Promise<void> => {
      const res = await apiCall<User[]>({
        method: 'GET',
        url: `/users/all/team/${team.name}`,
      });
      if (!isError(res)) {
        const contributors = res.data.result;
        setAllTeamContributors(contributors);
        setFilteredContributors(filterContributors(contributors));
      }
    };
    if (selectContributorMode) {
      if (allTeamContributors) {
        isInternal
          ? setFilteredContributors(
              filterInternal(filterContributors(allTeamContributors)),
            )
          : setFilteredContributors(filterContributors(allTeamContributors));
        return;
      }
      getContributorsByTeam();
    } else {
      setSelectedContributor('');
    }
  }, [
    selectContributorMode,
    team.name,
    filterContributors,
    allTeamContributors,
    isInternal,
  ]);

  const renderCardHeader = (): JSX.Element => {
    void 0;
    if (editTargetMode) {
      return (
        <div className="target-row">
          <div className="target-text">
            <div style={{ display: 'flex' }}>
              {assignmentContributors.length} out of{' '}
            </div>
            <Input
              className="target-input"
              value={isNaN(totalPositions) ? '' : totalPositions}
              onChange={(_, { value }) => setTotalPositions(parseInt(value))}
            />
            <div style={{ display: 'block', position: 'relative' }}>
              {pluralize(
                'position',
                team.target + assignmentContributors.length,
              )}{' '}
              filled
            </div>
          </div>

          <Button content="Save" color="black" onClick={changeTarget} />
        </div>
      );
    } else if (team.name === 'Writing') {
      return <p>{assignmentContributors.length} out of 1 position filled</p>;
    }
    return (
      <>
        <p>
          {assignmentContributors.length} out of{' '}
          {team.target + assignmentContributors.length}{' '}
          {pluralize('position', team.target + assignmentContributors.length)}{' '}
          filled
        </p>
        {!notApproved && (
          <AuthView view="minStaff">
            <Icon
              name="pencil"
              link
              onClick={() => {
                setEditTargetMode(true);
                setTotalPositions(team.target + assignmentContributors.length);
              }}
            />
          </AuthView>
        )}
      </>
    );
  };

  return (
    <div className="approve-claim-card">
      <div className="card-header">
        <FieldTag name={team.name} hexcode={team.color} />
        {renderCardHeader()}
      </div>
      <Divider />
      {!completed && renderAddContributor()}
      <div className="claim-section">
        {pendingContributors.map(({ user, message }, idx) => {
          void 0;
          return (
            <div key={idx} className="claim-row">
              <div className="field-tag-popup">
                <UserChip user={user} />
                <AuthView view="minStaff">
                  <Popup
                    content={message}
                    trigger={
                      <Icon
                        style={{ fontSize: '16px', cursor: 'pointer' }}
                        name="question circle"
                      />
                    }
                    wide="very"
                    position="right center"
                    hoverable
                  />
                </AuthView>
              </div>
              {!notApproved && (
                <AuthView view="minStaff">
                  <div className="button-group">
                    <Checkbox
                      label="Notify Users"
                      onChange={() => setClaimNotify(!claimNotify)}
                      defaultChecked
                    ></Checkbox>
                    <Button
                      content="Approve"
                      positive
                      size="small"
                      onClick={() => approveClaim(user._id)}
                    />
                    <Button
                      content="Decline"
                      negative
                      size="small"
                      onClick={() => declineClaim(user._id)}
                    />
                  </div>
                </AuthView>
              )}
              <AuthView view="isContributor">
                <FieldTag content="pending" />
              </AuthView>
            </div>
          );
        })}
        {assignmentContributors.map((contributor, idx) => (
          <div key={idx} className="claim-row">
            <UserChip user={contributor} />
            {!notApproved && (
              <AuthView view="minStaff">
                {completed ? (
                  <ContributorFeedback
                    user={contributor}
                    team={team}
                    pitchId={pitchId}
                  />
                ) : (
                  <Icon
                    name="trash"
                    link
                    onClick={() => removeContributor(contributor._id)}
                  />
                )}
              </AuthView>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApproveClaimCard;
