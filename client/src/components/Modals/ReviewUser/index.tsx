import React, { ReactElement, FC, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  Grid,
  Modal,
  ModalProps,
  Icon,
  Form,
  Input,
} from 'semantic-ui-react';
import { IUser } from 'ssw-common';
import { isError } from 'lodash';

import { approveUser, declineUser, updateUser } from '../../../api';
import { useInterests, useTeams } from '../../../contexts';
import { UserPicture, FieldTag } from '../..';
import { getUserFullName, titleCase } from '../../../utils/helpers';

import './styles.scss';
interface ReviewUserProps extends ModalProps {
  user: IUser;
}

const ReviewUserModal: FC<ReviewUserProps> = ({ user }): ReactElement => {
  const [formValue, setFormValue] = useState('');

  const { getTeamFromId } = useTeams();
  const { getInterestById } = useInterests();

  const notifySuccess = (): string =>
    toast.success('Approved User', {
      position: 'bottom-right',
    });

  const notifyDecline = (): string =>
    toast.success('Declined user', {
      position: 'bottom-right',
    });

  // Handle approve
  const handleApprove = (user: IUser): void => {
    const reasoningAdded = updateUser(
      {
        onboardReasoning: formValue,
      },
      user._id,
    );
    const userApproved = approveUser(user._id);
    if (!isError(reasoningAdded) && !isError(userApproved)) {
      notifySuccess();
    }
  };

  const formatDate = (date: Date): string => {
    date = new Date(date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  const handleDecline = (user: IUser): void => {
    const reasoningAdded = updateUser(
      {
        onboardReasoning: formValue,
      },
      user._id,
    );
    const userDenied = declineUser(user._id);
    if (!isError(reasoningAdded) && !isError(userDenied)) {
      notifyDecline();
    }
  };

  return (
    <>
      <Modal.Header>Review User</Modal.Header>
      <Modal.Content>
        <Grid divided="vertically">
          <Grid.Row columns={2}>
            <Grid.Column>
              <div className="user-info">
                <UserPicture className="review-user-picture" user={user} />
                <div className="user-info-text">
                  <b>
                    {user.preferredName
                      ? `${user.preferredName} (${user.firstName} ${user.lastName})`
                      : getUserFullName(user)}
                  </b>
                  <br></br>
                  {user.pronouns.join(', ')}
                </div>
              </div>
            </Grid.Column>
            <Grid.Column>
              <div>
                <Icon name="mail" />
                {user.email}
              </div>
              <div>
                <Icon name="phone" />
                {user.phone}
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <b>Genders:</b> {user.genders.join(', ')}
              <br /> <b>Races:</b> {user.races.map(titleCase).join(', ')}
              {/* TODO - update when the neighborhoods field is added to the user model */}
              <br /> <b>Neighborhood:</b> Place Holder, update when the
              neighborhoods field is added to the user model
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={4}>
            <Grid.Column>
              <b>Role</b>
              <div>
                <FieldTag
                  className="role-tag"
                  content={user.role}
                  size="medium"
                />
              </div>
            </Grid.Column>
            <Grid.Column>
              <b>Teams</b>
              <div style={{ display: 'flex' }}>
                {user.teams.map(getTeamFromId).map((team, index) => (
                  <Grid.Row key={index}>
                    <FieldTag
                      className="team-tag"
                      name={team?.name}
                      hexcode={team?.color}
                      size="medium"
                    />
                  </Grid.Row>
                ))}
              </div>
            </Grid.Column>
            <Grid.Column>
              <b>Topic Interests</b>
              <div>
                {user.interests.map((interest: string, index: number) => {
                  const fullInterest = getInterestById(interest);

                  return (
                    <FieldTag
                      className="interest-tag"
                      key={index}
                      name={fullInterest?.name}
                      hexcode={fullInterest?.color}
                      size="medium"
                    />
                  );
                })}
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <div className="paragraph">
                <b>How and why user wants to get involved</b>
                <br />
                {user.involvementResponse}
              </div>
              <div className="paragraph">
                <b>User's past experience</b>
                <br />
                {/* TODO - update when past experience field is added to the user model */}
                Place Holder, update when past experience field is added to the
                user model
              </div>
              <span style={{ color: 'gray' }}>
                Registered on {formatDate(user.dateJoined)}
              </span>
              <h5>
                Reasoning <span style={{ color: 'gray' }}>- Optional</span>
              </h5>
              <Form>
                <Input
                  type="text"
                  onChange={(e) => setFormValue(e.currentTarget.value)}
                ></Input>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Modal.Actions className="review-user-actions">
          <Button
            className="approve-button"
            onClick={() => {
              handleApprove(user);
            }}
          >
            Approve
          </Button>
          <Button
            className="decline-button"
            onClick={() => {
              handleDecline(user);
            }}
          >
            Decline
          </Button>
        </Modal.Actions>
      </Modal.Content>
    </>
  );
};

export default ReviewUserModal;
