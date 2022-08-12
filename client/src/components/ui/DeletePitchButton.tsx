import React, { FC, ReactElement } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { Button, ModalProps } from 'semantic-ui-react';
import { FullPopulatedPitch } from 'ssw-common';

import { apiCall, isError } from '../../api';

interface DeletePitchProps extends ModalProps {
  pitch: FullPopulatedPitch;
}

const DeletePitchButton: FC<DeletePitchProps> = ({ pitch }): ReactElement => {
  const history = useHistory();
  const deletePitch = async (): Promise<void> => {
    const res = await apiCall({
      method: 'PUT',
      url: `pitches/${pitch._id}`,
      body: {
        isDeleted: true,
      },
    });

    if (!isError(res)) {
      toast.success('Successfully deleted pitch!');
      history.goBack();
    } else {
      toast.error('Unable to delete pitch');
    }
  };

  return <Button border content="Delete Pitch" onClick={deletePitch}></Button>;
};

export default DeletePitchButton;
