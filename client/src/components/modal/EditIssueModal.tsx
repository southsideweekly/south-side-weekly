import React, { FC, FormEvent, ReactElement, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  CheckboxProps,
  Form,
  Icon,
  Modal,
  ModalProps,
} from 'semantic-ui-react';
import { IIssue, PopulatedIssue } from 'ssw-common';

import { apiCall, isError } from '../../api';
import { issueTypeEnum } from '../../utils/enums';
import { addTime } from '../../utils/helpers';
import { Pusher } from '../ui/Pusher';
import { SecondaryButton } from '../ui/SecondaryButton';
import './AddIssue.scss';
import './modals.scss';

interface EditIssueProps extends ModalProps {
  issue: PopulatedIssue;
  updateFunction: () => void;
}

const defaultData: FormData = {
  releaseDate: '',
  type: '',
  isDeleted: false,
};

type FormData = Pick<IIssue, 'releaseDate' | 'type' | 'isDeleted'>;

const EditIssueModal: FC<EditIssueProps> = ({
  issue,
  updateFunction,
  ...rest
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(defaultData);
  const [touchedDate, setTouchedDate] = useState(false);

  const editIssue = async (): Promise<void> => {
    const res = await apiCall({
      method: 'PUT',
      url: `/issues/${issue._id}`,
      body: {
        ...formData,
        releaseDate: touchedDate
          ? new Date(addTime(formData.releaseDate))
          : issue.releaseDate,
      },
    });

    if (!isError(res)) {
      toast.success('Successfully updated current issue!');
      updateFunction();
      setIsOpen(false);
    } else if (res.error.response.status === 409) {
      toast.error('Issue with this date and type already exists');
    } else {
      toast.error('Unable to update current issue');
    }
  };

  const deleteIssue = async (): Promise<void> => {
    const res = await apiCall({
      method: 'PUT',
      url: `/issues/${issue._id}`,
      body: {
        ...formData,
        releaseDate: touchedDate
          ? new Date(addTime(formData.releaseDate))
          : issue.releaseDate,
        isDeleted: true,
      },
    });

    if (!isError(res)) {
      toast.success('Successfully deleted current issue!');
      updateFunction();
      setIsOpen(false);
    } else if (res.error.response.status === 409) {
      toast.error('Issue with this date and type already exists');
    } else {
      toast.error('Unable to delete current issue');
    }
  };

  const changeField = <T extends keyof FormData>(
    key: T,
    value: FormData[T],
  ): void => {
    const data = { ...formData };
    data[key] = value;
    setFormData(data);
  };

  const handleRadio = (
    _: FormEvent<HTMLInputElement>,
    { value }: CheckboxProps,
  ): void => {
    changeField('type', value ? (value as string) : '');
  };

  const formatDate = (date: Date | undefined): string =>
    new Date(date || new Date()).toISOString().split('T')[0];

  useEffect(() => {
    setFormData({
      releaseDate: issue.releaseDate,
      type: issue.type,
      isDeleted: false,
    });
  }, [isOpen, issue]);

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onOpen={() => setIsOpen(true)}
      trigger={
        <SecondaryButton
          border
          className="edit-btn"
          content="Edit Issue"
        ></SecondaryButton>
      }
      className="add-issue-modal"
      {...rest}
    >
      <Modal.Header>
        Edit Issue
        <Pusher />
        <Icon name="close" onClick={() => setIsOpen(false)} />
      </Modal.Header>
      <Modal.Content scrolling>
        <div className="modal-content">
          <Form>
            <Form.Input
              type="date"
              className="date-input"
              label="Publication Date"
              onChange={(_, { value }) => {
                if (value) {
                  changeField('releaseDate', formatDate(new Date(value)));
                  setTouchedDate(true);
                }
              }}
              defaultValue={formData.releaseDate.substring(
                0,
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                formData.releaseDate.length - 14,
              )}
            />
            <Form.Group className="issue-type">
              <Form.Radio
                label="Print"
                size="large"
                value={issueTypeEnum.PRINT}
                onChange={handleRadio}
                checked={formData.type === issueTypeEnum.PRINT}
              />
              <Form.Radio
                label="Online"
                size="large"
                value={issueTypeEnum.ONLINE}
                onChange={handleRadio}
                checked={formData.type === issueTypeEnum.ONLINE}
              />
            </Form.Group>
          </Form>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <SecondaryButton
          border
          className="delete-btn"
          content="Delete Issue"
          onClick={deleteIssue}
        ></SecondaryButton>
        <Button type="submit" onClick={editIssue} content="Save" secondary />
      </Modal.Actions>
    </Modal>
  );
};

export default EditIssueModal;
