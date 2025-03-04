import { XCircle } from '@phosphor-icons/react';
import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';

const BottomModalHeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  flex: 1,
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: props.theme.space.m,
}));

const ButtonImage = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  color: props.theme.colors.white_400,
  background: 'transparent',
}));

interface Props {
  header: string;
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
  overlayStylesOverriding?: {};
  contentStylesOverriding?: {};
}

const CustomisedModal = styled(Modal)`
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  position: absolute;
`;

function UpdatedBottomModal({
  header,
  children,
  visible,
  onClose,
  overlayStylesOverriding,
  contentStylesOverriding,
}: Props) {
  const theme = useTheme();
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const customStyles = {
    overlay: {
      backgroundColor: isGalleryOpen ? 'transparent' : theme.colors.background.modalBackdrop,
      height: '100%',
      width: 360,
      margin: 'auto',
      zIndex: 4,
      ...overlayStylesOverriding,
    },
    content: {
      inset: 'auto auto 0px auto',
      width: '100%',
      maxWidth: 360,
      maxHeight: '90%',
      border: 'transparent',
      background: theme.colors.background.elevation6_600,
      backdropFilter: 'blur(10px)',
      margin: 0,
      padding: 0,
      borderTopLeftRadius: isGalleryOpen ? 12 : 16,
      borderTopRightRadius: isGalleryOpen ? 12 : 16,
      borderBottomRightRadius: isGalleryOpen ? 12 : 0,
      borderBottomLeftRadius: isGalleryOpen ? 12 : 0,
      ...contentStylesOverriding,
    },
  };

  return (
    <CustomisedModal
      isOpen={visible}
      parentSelector={() => document.getElementById('app') as HTMLElement}
      ariaHideApp={false}
      style={customStyles}
      contentLabel="Example Modal"
    >
      <RowContainer>
        <BottomModalHeaderText>{header}</BottomModalHeaderText>
        <ButtonImage onClick={onClose}>
          <XCircle color="currentColor" size={22} weight="fill" />
        </ButtonImage>
      </RowContainer>
      {children}
    </CustomisedModal>
  );
}

export default UpdatedBottomModal;
