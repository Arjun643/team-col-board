import { store } from '../redux/store';
import { addActivity } from '../redux/slices/activitiesSlice';

class ActivityService {
  trackTaskAdded(user, taskName) {
    store.dispatch(
      addActivity({
        type: 'TASK_ADDED',
        user,
        data: { taskName },
      })
    );
  }

  trackTaskMoved(user, taskName, newStatus) {
    store.dispatch(
      addActivity({
        type: 'TASK_MOVED',
        user,
        data: { taskName, newStatus },
      })
    );
  }

  trackTaskDeleted(user, taskName) {
    store.dispatch(
      addActivity({
        type: 'TASK_DELETED',
        user,
        data: { taskName },
      })
    );
  }

  trackMemberJoined(memberName) {
    store.dispatch(
      addActivity({
        type: 'MEMBER_JOINED',
        data: { memberName },
      })
    );
  }

  trackChatMessage(user, roomId) {
    store.dispatch(
      addActivity({
        type: 'CHAT_MESSAGE',
        user,
        data: { roomId },
      })
    );
  }
}

export default new ActivityService(); 