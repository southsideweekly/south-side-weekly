import React, { ReactElement, FC, useState } from 'react';
import {
  Grid,
  Modal,
  ModalProps,
  Icon,
  Form,
  Message,
  Checkbox,
} from 'semantic-ui-react';
import { BasePopulatedUser } from 'ssw-common';

import { UserPicture, FieldTag } from '..';
import { titleCase } from '../../utils/helpers';
import { SecondaryButton } from '../ui/SecondaryButton';
import { PrimaryButton } from '../ui/PrimaryButton';
import { approveUser, rejectUser } from '../../api';
import { TagList } from '../list/TagList';
import { useAuth } from '../../contexts';

import './modals.scss';
import './ReviewUser.scss';

interface ReviewUserProps extends ModalProps {
  user: BasePopulatedUser;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type: 'reject' | 'review';
}

export const ReviewUser: FC<ReviewUserProps> = ({
  user,
  open,
  setOpen,
  type,
  ...rest
}): ReactElement => {
  const [onboardReasoning, setOnboardReasoning] = useState('');
  const [notify, setNotify] = useState(true);
  const { user: currentUser } = useAuth();

  return (
    <Modal
      {...rest}
      open={open}
      onClose={() => setOpen(false)}
      className="review-user-modal"
    >
      <Modal.Header className="review-user-header">
        {type === 'reject' ? 'View Rejected User' : 'Review User'}
      </Modal.Header>
      <Modal.Content scrolling>
        <Grid divided="vertically">
          <Grid.Row columns={2}>
            <Grid.Column>
              <div className="user-info">
                <UserPicture className="review-user-picture" user={user} />
                <div className="user-info-text">
                  <b>{user.joinedNames}</b>
                  <br />
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
            <Grid.Column>
              <b>Genders:</b> {user.genders.join(', ')}
              <br /> <b>Races:</b> {user.races.map(titleCase).join(', ')}
              <br /> <b>Neighborhood:</b>
              {user.neighborhood}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns="4">
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
              <div>
                <TagList tags={user.teams} />
              </div>
            </Grid.Column>
            <Grid.Column width={8}>
              <b>Topic Interests</b>
              <div>
                <TagList tags={user.interests} />
              </div>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row columns={1}>
            <Grid.Column>
              {type === 'reject' && (
                <Message
                  size="small"
                  className="reject-message"
                  header="Rejection Reasoning"
                  warning
                  content={user.onboardReasoning}
                />
              )}
              <span style={{ color: 'gray' }}>
                {type === 'reject' ? 'Applied' : 'Registered'} on{' '}
                {new Date(user.dateJoined).toLocaleDateString()}
              </span>
            </Grid.Column>
            <Grid.Column>
              <div className="section">
                <b>How and why user wants to get involved</b>
                <br />
                {user.involvementResponse}
              </div>
              <div className="section">
                <b>User's past experience</b>
                <br />
                {user.journalismResponse}
              </div>

              {type === 'review' && (
                <>
                  <h5>
                    Reasoning <span style={{ color: 'gray' }}>- Optional</span>
                  </h5>
                  <Form.Input
                    fluid
                    value={onboardReasoning}
                    onChange={(e, { value }) => setOnboardReasoning(value)}
                  />
                  <h5>
                    <Checkbox
                      label="Notify User through Email"
                      defaultChecked
                      onChange={() => setNotify(!notify)}
                    ></Checkbox>
                  </h5>
                </>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Content>
      {type === 'review' && (
        <Modal.Actions className="review-user-actions">
          <PrimaryButton
            className="approve-button"
            onClick={() => approveUser(user, currentUser, notify)}
            content="Approve"
          />
          <SecondaryButton
            className="decline-button"
            onClick={() =>
              rejectUser(user, currentUser, onboardReasoning, notify)
            }
            content="Decline"
            border
          />
        </Modal.Actions>
      )}
    </Modal>
  );
};
