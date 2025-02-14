import React from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import {
  BasePopulatedPitch,
  BasePopulatedUser,
  FullPopulatedPitch,
  Pitch,
  Resource,
  Team,
} from 'ssw-common';

import { EditInterests, EditTeams, FieldTag, UserPicture } from '..';
import { approveUser, rejectUser } from '../../api/apiWrapper';
import { useAuth, useTeams } from '../../contexts';
import {
  findPendingContributor,
  getPitchTeamsForContributor,
  getUserClaimStatusForPitch,
} from '../../utils/helpers';
import {
  ClaimableTeamsList,
  ClaimableTeamsPitch,
} from '../list/ClaimableTeamsList';
import { TagList } from '../list/TagList';
import UserChip from '../tag/UserChip';
import { LinkDisplay } from '../ui/LinkDisplayButton';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';

import { configureColumn } from './dynamic/DynamicTable2.0';

export const profilePic = configureColumn<BasePopulatedUser>({
  id: 'profilePic',
  title: '',
  width: 1,
  extractor: function Pic(user: BasePopulatedUser) {
    return (
      <UserPicture style={{ width: '25px', margin: 'auto' }} user={user} />
    );
  },
});

export const nameColumn = configureColumn<BasePopulatedUser>({
  id: 'firstName',
  title: 'Name',
  width: 3,
  extractor: function getName(user: BasePopulatedUser) {
    return `${user.joinedNames} (${user.pronouns.join('/')})`;
  },
  sortable: true,
});

export const roleColumn = configureColumn<BasePopulatedUser>({
  id: 'role',
  title: 'Role',
  width: 1,
  extractor: function getRoles(user: BasePopulatedUser) {
    return <FieldTag size="tiny" content={user.role} />;
  },
  sortable: true,
});

export const teamsColumn = configureColumn<BasePopulatedUser>({
  id: 'teams',
  title: 'Teams',
  width: 2,
  extractor: function getTeams(user: BasePopulatedUser) {
    return (
      <TagList
        size="tiny"
        tags={user.teams.sort((a, b) => a.name.localeCompare(b.name))}
      />
    );
  },
});

export const interestsColumn = configureColumn<BasePopulatedUser>({
  id: 'interests',
  title: 'Interests',
  width: 2,
  extractor: function getInterests(user: BasePopulatedUser) {
    return (
      <TagList
        size="tiny"
        tags={user.interests.sort((a, b) => a.name.localeCompare(b.name))}
        limit={3}
      />
    );
  },
});

export const teamsModalColumn = configureColumn<BasePopulatedUser>({
  ...teamsColumn,
  title: (
    <span>
      Teams <EditTeams />
    </span>
  ),
});

export const interestsModalColumn = configureColumn<BasePopulatedUser>({
  ...interestsColumn,
  title: (
    <span>
      Interests <EditInterests />
    </span>
  ),
});

export const statusColumn = configureColumn<BasePopulatedUser>({
  id: 'activityStatus',
  title: 'Status',
  width: 1,
  extractor: function getStatus(user: BasePopulatedUser) {
    return <FieldTag size="tiny" content={user.activityStatus} />;
  },
});

export const ratingColumn = configureColumn<BasePopulatedUser>({
  id: 'rating',
  title: 'Rating',
  width: 2,
  extractor: function GetRating(user: BasePopulatedUser) {
    const { user: currentUser } = useAuth();

    if (currentUser?._id === user._id) {
      return <Icon name="x" color="red" />;
    }

    return `${user.rating ? user.rating.toFixed(2) : '-'} / 5`;
  },
  sortable: true,
});

export const joinedColumn = configureColumn<BasePopulatedUser>({
  id: 'dateJoined',
  title: 'Joined',
  width: 2,
  extractor: function getJoined(user: BasePopulatedUser) {
    return new Date(user.dateJoined).toLocaleDateString();
  },
  sortable: true,
});

export const actionColumn = configureColumn<BasePopulatedUser>({
  title: '',
  width: 2,
  extractor: function GetAction(user: BasePopulatedUser) {
    const { user: currentUser } = useAuth();

    return (
      <div style={{ display: 'flex' }}>
        <PrimaryButton
          size="mini"
          onClick={() => approveUser(user, currentUser, true)}
          content="Approve"
        />
        <SecondaryButton
          size="mini"
          onClick={() => rejectUser(user, currentUser, '', true)}
          content="Decline"
          border
        />
      </div>
    );
  },
});

export const rejectionColumn = configureColumn<BasePopulatedUser>({
  id: 'onboardReasoning',
  width: 4,
  title: 'Rejection Reasoning',
  extractor: 'onboardReasoning',
});

export const onboardStatusColumn = configureColumn<BasePopulatedUser>({
  id: 'onboardingStatus',
  title: 'Onboarding Status',
  width: 2,
  extractor: function getOnboardStatus(user: BasePopulatedUser) {
    return <FieldTag size="tiny" content={user.onboardingStatus} />;
  },
});

export const titleColumn = configureColumn({
  id: 'title',
  title: 'Title',
  width: 4,
  extractor: 'title',
  sortable: true,
});

export const internalColumn = configureColumn<Pick<Pitch, 'isInternal'>>({
  id: 'isInternal',
  title: 'Visibility',
  width: 1,
  extractor: function getVIsibility(pitch) {
    return <div>{pitch.isInternal ? <>Internal</> : <></>}</div>;
  },
});

export const descriptionColumn = configureColumn<Pick<Pitch, 'description'>>({
  id: 'description',
  title: 'Description',
  width: 4,
  extractor: function getDescription(pitch) {
    return (
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordWrap: 'break-word',
          maxHeight: '3.6em',
          lineHeight: '1.8em',
        }}
      >
        {pitch.description}
      </div>
    );
  },
});

export const associatedInterestsColumn = configureColumn<
  Pick<BasePopulatedPitch, 'topics'>
>({
  id: 'topics',
  title: 'Associated Interests',
  extractor: function getInterests(pitch) {
    return (
      <TagList
        size="tiny"
        tags={pitch.topics.sort((a, b) => a.name.localeCompare(b.name))}
        limit={3}
      />
    );
  },
  width: 3,
});

export const claimableTeamsColumn = configureColumn<ClaimableTeamsPitch>({
  title: 'Teams You Can Claim',
  extractor: function getTeams(pitch) {
    return <ClaimableTeamsList pitch={pitch} />;
  },
  width: 2,
});

export const submittedColumn = configureColumn<
  Pick<BasePopulatedPitch, 'author'>
>({
  id: 'author',
  title: 'Submitter',
  width: 2,
  extractor: function getSubmitter(pitch) {
    return <UserChip user={pitch.author} />;
  },
  sortable: true,
});

export const selfWriteColumn = configureColumn<
  Pick<BasePopulatedPitch, 'writer'>
>({
  title: 'Self-write',
  width: 1,
  extractor: function getSelfWrite(pitch) {
    if (!pitch.writer) {
      return <></>;
    }

    return (
      <div>
        <Icon color="green" name="check" />
      </div>
    );
  },
});

export const googleDocColumn = configureColumn<
  Pick<BasePopulatedPitch, 'assignmentGoogleDocLink'>
>({
  id: 'assignmentGoogleDocLink',
  title: 'Google Doc',
  width: 1,
  extractor: function getGoogleDoc(pitch) {
    return (
      <LinkDisplay
        style={{ fontSize: '1.25em' }}
        href={pitch.assignmentGoogleDocLink}
      />
    );
  },
});

export const deadlineColumn = configureColumn<
  Pick<BasePopulatedPitch, 'deadline'>
>({
  id: 'deadline',
  title: 'Deadline',
  width: 1,
  extractor: function getDeadline({ deadline }) {
    return new Date(deadline).toLocaleDateString();
  },
});

export const unclaimedTeamsColumn = configureColumn<ClaimableTeamsPitch>({
  title: 'Unclaimed Teams',
  width: 2,
  extractor: function GetUnclaimedTeams({ ...pitch }) {
    const { teams } = useTeams();

    const EDITING_TEAM = teams.find((team) => team.name === 'Editing')!;
    const WRITING_TEAM = teams.find((team) => team.name === 'Writing')!;

    const getUnclaimedTeams = (pitch: ClaimableTeamsPitch): Team[] => {
      const needsEditors =
        pitch.secondEditors.length === 0 || pitch.thirdEditors.length === 0;
      const needsWriter = pitch.writer === null;

      const unclaimedTeams = pitch.teams
        .filter((team) => team.target > 0)
        .map((team) => team.teamId);

      if (needsEditors) {
        unclaimedTeams.push(EDITING_TEAM);
      }

      if (needsWriter) {
        unclaimedTeams.push(WRITING_TEAM);
      }

      return unclaimedTeams.sort((a, b) => a.name.localeCompare(b.name));
    };

    return (
      <div>
        <TagList size="tiny" tags={getUnclaimedTeams(pitch)} limit={3} />
      </div>
    );
  },
});

export const teamsRequireApprovalColumn = configureColumn<BasePopulatedPitch>({
  title: 'Teams Requring Approval',
  width: 2,
  extractor: function GetTeams({ pendingContributors }) {
    const { getTeamFromId } = useTeams();
    const teamIds = [
      ...new Set(pendingContributors.map((c) => c.teams).flat()),
    ];

    return (
      <TagList
        size="tiny"
        tags={teamIds.map(getTeamFromId).filter((team) => team !== undefined)}
      />
    );
  },
});

export const pitchStatusCol = configureColumn<
  Pick<BasePopulatedPitch, 'title' | 'status'>
>({
  id: 'status',
  title: 'Status',
  width: 1,
  extractor: function StatusCell({ status }) {
    return <FieldTag content={status} size={'small'} />;
  },
});

export const dateSubmittedCol = configureColumn<
  Pick<BasePopulatedPitch, 'createdAt'>
>({
  id: 'createdAt',
  title: 'Date Submitted',
  width: 1,
  extractor: function DateCell(pitch) {
    return new Date(pitch.createdAt).toLocaleDateString();
  },
});

export const associatedTeamsColumn = configureColumn<
  BasePopulatedPitch | FullPopulatedPitch
>({
  title: "Teams You're On",
  width: 4,
  extractor: function TeamsCell({ ...pitch }) {
    const { user } = useAuth();
    const { teams } = useTeams();

    return (
      <div>
        <TagList
          size="tiny"
          tags={getPitchTeamsForContributor(pitch, user!, teams)!}
          limit={8}
        />
      </div>
    );
  },
});

export const claimedPitchStatusColumn = configureColumn<BasePopulatedPitch>({
  title: <div style={{ textAlign: 'center' }}>Claim Request Status</div>,
  width: 2,
  extractor: function ClaimStatusCell({ ...pitch }) {
    const { user } = useAuth();

    if (
      pitch.assignmentContributors?.some(
        (contributor) => contributor.userId._id === user?._id,
      ) ||
      pitch.writer?._id === user?._id ||
      pitch.primaryEditor?._id === user?._id ||
      pitch.secondEditors.some((editor) => editor._id === user?._id) ||
      pitch.thirdEditors.some((editor) => editor._id === user?._id)
    ) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Popup
            basic
            trigger={<Icon color="green" name="check" />}
            content="You have claimed this pitch."
          />
        </div>
      );
    } else if (
      pitch.pendingContributors.some(
        (contributor) => contributor.userId === user?._id,
      )
    ) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Popup
            basic
            trigger={<Icon size="small" color="yellow" name="clock" />}
            content="You have submitted a claim request for this pitch."
          />
        </div>
      );
    }
    return <div style={{ textAlign: 'center' }}>None</div>;
  },
});

export const requestedTeamsColumn = configureColumn<BasePopulatedPitch>({
  title: 'Team(s) Requested to Claim',
  width: 2,
  extractor: function TeamsCell(pitch) {
    const { user } = useAuth();
    const { getTeamFromId } = useTeams();
    const { teams } = findPendingContributor(pitch, user!) ?? { teams: [] };

    return (
      <div>
        <TagList size="tiny" tags={teams.map(getTeamFromId)} />
      </div>
    );
  },
});

export const claimStatusColumn = configureColumn<
  FullPopulatedPitch | BasePopulatedPitch
>({
  title: 'Status',
  width: 1,
  extractor: function StatusCell(pitch) {
    const { user } = useAuth();
    return (
      <FieldTag
        content={getUserClaimStatusForPitch(pitch, user!)}
        size="small"
      />
    );
  },
});

export const publishDateColumn = configureColumn<FullPopulatedPitch>({
  title: 'Publish Date',
  width: 1,
  extractor: function DateCell(pitch) {
    if (!pitch.issueStatuses || pitch.issueStatuses.length <= 0) {
      return undefined;
    }

    return new Date(
      pitch.issueStatuses[0].issueId.releaseDate,
    ).toLocaleDateString();
  },
});

export const resourceTitleColumn = configureColumn<Resource>({
  title: null,
  width: 1,
  extractor: 'name',
});

export const adminResourceTitleColumn = configureColumn<Resource>({
  title: 'Title',
  width: 5,
  extractor: 'name',
  sortable: true,
  id: 'name',
});

export const visibilityColumn = configureColumn<Resource>({
  id: 'visibility',
  title: 'Visibility',
  width: 1,
  sortable: true,
  extractor: function getVisibility(resource) {
    return <FieldTag content={resource.visibility} size="small" />;
  },
});
