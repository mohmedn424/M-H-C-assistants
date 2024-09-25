// import pb from '../lib/pocketbase';
// import { useIdleStatus } from '../store';

import pb from '../lib/pocketbase';
import { useIdleStatus } from '../stores/userStore';

export default function IdleOverly() {
  const { idleStatus } = useIdleStatus();

  return (
    <div
      className={
        idleStatus ? 'idle-overlay idle-overlay-on' : 'idle-overlay'
      }
    >
      <div className="container">
        {/* {pb.authStore.model?.avatar && (
          <div className="avatar">
            <img
              src={pb.files.getUrl(
                {
                  id: pb.authStore.model.id,
                  avatar: pb.authStore.model.avatar,
                  collectionId: pb.authStore.model.collectionId,
                },
                pb.authStore.model.avatar
              )}
            />
          </div>
        )} */}
        <h1>{pb.authStore.model.name}</h1>
      </div>
    </div>
  );
}
