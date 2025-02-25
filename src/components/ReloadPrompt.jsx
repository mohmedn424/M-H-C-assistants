import { Modal } from 'antd-mobile';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  return needRefresh ? (
    <Modal
      content="New content available, click reload to update."
      closeOnAction
      onAction={handleUpdate}
      actions={[{ text: 'Reload', primary: true }]}
    />
  ) : null;
}

export default ReloadPrompt;
